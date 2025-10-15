// app/api/tree/[id]/route.ts
export const runtime = "nodejs";
export const revalidate = 30; // short cache; adjust if needed

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ---------- Types ---------- */
type BasePerson = {
  id: string;
  givenName: string | null;
  familyName: string | null;
  gender: string | null;
};

type PersonLite = BasePerson & {
  fullName: string;
};

/* ---------- Helpers ---------- */
function toFullName(given: string | null, family: string | null) {
  const s = [given ?? "", family ?? ""].join(" ").trim();
  return s || "(unknown)";
}

function nice(p: BasePerson | null | undefined): PersonLite | null {
  if (!p) return null;
  return {
    ...p,
    fullName: toFullName(p.givenName, p.familyName),
  };
}

const isMale = (g?: string | null) => (g ?? "").toLowerCase().startsWith("m");

/* ---------- Data fetch helpers ---------- */
async function getParents(personId: string): Promise<(PersonLite | null)[]> {
  const rows = await prisma.parentChild.findMany({
    where: { childId: personId },
    select: {
      parent: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
  });
  return rows.map((r) => nice(r.parent));
}

async function getGrandparents(personId: string) {
  const parents = await getParents(personId);
  const gp = await Promise.all(
    parents.map(async (p) => ({
      parent: p,
      parents: p ? await getParents(p.id) : [],
    }))
  );
  // [{ parent: <father/mother>, parents: [grandpa, grandma] }, ...]
  return gp;
}

/**
 * Return ALL spouses of the person as flat PersonLite objects.
 * - Uses aId/bId with relations a/b from your schema.
 * - Orders by marriage start ascending.
 * - De-duplicates by spouse.id while preserving order.
 */
async function getSpouses(personId: string): Promise<PersonLite[]> {
  const marriages = await prisma.marriage.findMany({
    where: { OR: [{ aId: personId }, { bId: personId }] },
    select: {
      aId: true,
      bId: true,
      start: true,
      a: { select: { id: true, givenName: true, familyName: true, gender: true } },
      b: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
    orderBy: [{ start: "asc" }],
  });

  // map to the other party in each marriage
  const raw = marriages.map((m) => (m.aId === personId ? m.b : m.a));
  const list = raw.map((p) => nice(p)).filter(Boolean) as PersonLite[];

  // de-dupe by spouse id (preserve first occurrence = earliest marriage)
  const seen = new Set<string>();
  return list.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

/**
 * Children grouped by co-parent (spouse) — batched (no N+1):
 * - Fetch all children of focus
 * - Fetch all co-parent links for those children in one query
 * - Fetch all grandchildren for those children in one query
 */
async function getChildrenGroupedBySpouse(personId: string) {
  // 1) children of focus (one query)
  const childrenLinks = await prisma.parentChild.findMany({
    where: { parentId: personId },
    select: {
      childId: true,
      child: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
    orderBy: { childId: "asc" },
  });

  const childIds = childrenLinks.map((c) => c.childId);
  if (childIds.length === 0) return [] as Array<{
    spouse: PersonLite | null;
    children: Array<{ person: PersonLite; grandchildren: PersonLite[] }>;
  }>;

  // 2) co-parents for all those children (one query)
  const coParentLinks = await prisma.parentChild.findMany({
    where: {
      childId: { in: childIds },
      NOT: { parentId: personId },
    },
    select: {
      childId: true,
      parent: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
  });

  // Map childId -> (first) co-parent
  const coParentByChildId = new Map<string, BasePerson | null>();
  for (const c of childrenLinks) coParentByChildId.set(c.childId, null); // default
  for (const link of coParentLinks) {
    if (!coParentByChildId.get(link.childId)) {
      coParentByChildId.set(link.childId, link.parent as BasePerson);
    }
  }

  // 3) grandchildren for ALL those children in one query
  const gkidLinks = await prisma.parentChild.findMany({
    where: { parentId: { in: childIds } },
    select: {
      parentId: true,
      child: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
    orderBy: { parentId: "asc" },
  });

  const gkidsByParentId = new Map<string, PersonLite[]>();
  for (const id of childIds) gkidsByParentId.set(id, []);
  for (const row of gkidLinks) {
    const list = gkidsByParentId.get(row.parentId)!;
    list.push(nice(row.child)!);
  }

  // 4) bucket children by co-parent
  type Bucket = {
    spouse: PersonLite | null;
    children: Array<{ person: PersonLite; grandchildren: PersonLite[] }>;
  };
  const bucketsMap = new Map<string, Bucket>();

  for (const row of childrenLinks) {
    const childLite = nice(row.child)!;
    const co = coParentByChildId.get(row.childId) || null;
    const key = co?.id ?? "unknown";

    if (!bucketsMap.has(key)) {
      bucketsMap.set(key, { spouse: nice(co), children: [] });
    }
    bucketsMap.get(key)!.children.push({
      person: childLite,
      grandchildren: gkidsByParentId.get(row.childId) || [],
    });
  }

  const buckets = Array.from(bucketsMap.values());

  // sort: known spouses first, then unknown; then by spouse name
  buckets.sort((a, b) => {
    if (!a.spouse && b.spouse) return 1;
    if (a.spouse && !b.spouse) return -1;
    const an = a.spouse?.fullName ?? "~";
    const bn = b.spouse?.fullName ?? "~";
    return an.localeCompare(bn);
  });

  return buckets;
}

/* ---------- Route ---------- */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const personRaw = await prisma.person.findUnique({
      where: { id: params.id },
      select: { id: true, givenName: true, familyName: true, gender: true },
    });
    if (!personRaw) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const person = nice(personRaw)!;

    // Parallelize major fetches
    const [parents, grandparents, spouses, spouseBuckets] = await Promise.all([
      getParents(person.id),
      getGrandparents(person.id),
      getSpouses(person.id),             // ✅ now returns PersonLite[]
      getChildrenGroupedBySpouse(person.id),
    ]);

    // Up navigation: prefer father, else first parent
    const father = parents.find((p) => isMale(p?.gender)) ?? parents[0] ?? null;

    // Down navigation: prefer first male child, else any child
    const allChildren: PersonLite[] = spouseBuckets.flatMap((b) => b.children.map((c) => c.person));
    const firstSon = allChildren.find((c) => isMale(c.gender));
    const anyChild = allChildren[0] ?? null;
    const downTarget = firstSon ?? anyChild ?? null;

    return NextResponse.json({
      focus: person,
      parents,
      grandparents,
      spouses,         // ✅ flat list of PersonLite (names included)
      spouseBuckets,   // unchanged
      nav: {
        up: father ? { id: father.id, name: father.fullName } : null,
        down: downTarget ? { id: downTarget.id, name: downTarget.fullName } : null,
      },
    });
  } catch (e: any) {
    console.error("GET /api/tree/[id]:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
