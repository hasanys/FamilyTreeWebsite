// app/api/tree/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PersonLite = {
  id: string;
  givenName: string | null;
  familyName: string | null;
  gender: string | null;
};

function nice(p?: PersonLite | null) {
  if (!p) return null;
  const full = [p.givenName ?? "", p.familyName ?? ""].join(" ").trim();
  return { ...p, fullName: full || "(unknown)" };
}

async function getParents(personId: string) {
  const rows = await prisma.parentChild.findMany({
    where: { childId: personId },
    select: {
      parent: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
  });
  return rows.map(r => nice(r.parent));
}

async function getGrandparents(personId: string) {
  const parents = await getParents(personId);
  const gp = await Promise.all(
    parents.map(async (p) => ({
      parent: p,
      parents: await getParents(p!.id),
    }))
  );
  return gp; // [{ parent: <father/mother>, parents: [grandpa, grandma] }, ...]
}

async function getSpouses(personId: string) {
  const marriages = await prisma.marriage.findMany({
    where: { OR: [{ aId: personId }, { bId: personId }] },
    select: {
      id: true,
      aId: true, bId: true, start: true, nikahType: true,
      a: { select: { id: true, givenName: true, familyName: true, gender: true } },
      b: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
    orderBy: [{ start: "asc" }],
  });

  return marriages.map(m => {
    const spouse = m.aId === personId ? m.b : m.a;
    return {
      id: m.id,
      start: m.start,
      nikahType: m.nikahType ?? null,
      spouse: nice(spouse),
    };
  });
}

async function getChildrenGroupedBySpouse(personId: string) {
  // children of focus person
  const children = await prisma.parentChild.findMany({
    where: { parentId: personId },
    select: {
      child: { select: { id: true, givenName: true, familyName: true, gender: true } },
      childId: true,
    },
  });

  // find co-parent for each child (might be null/unknown)
  const withCoParent = await Promise.all(children.map(async (c) => {
    const others = await prisma.parentChild.findMany({
      where: { childId: c.childId, NOT: { parentId: personId } },
      select: { parent: { select: { id: true, givenName: true, familyName: true, gender: true } } },
    });
    return {
      child: nice(c.child),
      coParent: nice(others[0]?.parent ?? null),
    };
  }));

  // group by coParent.id (or 'unknown')
  const bySpouse = new Map<string, { spouse: PersonLite | null; children: any[] }>();
  for (const row of withCoParent) {
    const key = row.coParent?.id ?? "unknown";
    if (!bySpouse.has(key)) bySpouse.set(key, { spouse: (row.coParent as any) ?? null, children: [] });
    bySpouse.get(key)!.children.push(row.child);
  }

  // fetch grandchildren for each child
  const result: Array<{ spouse: ReturnType<typeof nice>; children: Array<{ person: any; grandchildren: any[] }> }> = [];
  for (const [, bucket] of bySpouse) {
    const childrenWithGrandkids = await Promise.all(
      bucket.children.map(async (ch: any) => {
        const gkids = await prisma.parentChild.findMany({
          where: { parentId: ch.id },
          select: { child: { select: { id: true, givenName: true, familyName: true, gender: true } } },
        });
        return {
          person: ch,
          grandchildren: gkids.map(g => nice(g.child)),
        };
      })
    );
    result.push({ spouse: bucket.spouse ? nice(bucket.spouse as any) : null, children: childrenWithGrandkids });
  }

  // sort spouses by known vs unknown, then alphabetically
  result.sort((a, b) => {
    const an = a.spouse?.fullName ?? "~";
    const bn = b.spouse?.fullName ?? "~";
    if (!a.spouse && b.spouse) return 1;
    if (a.spouse && !b.spouse) return -1;
    return an.localeCompare(bn);
  });

  return result;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      select: { id: true, givenName: true, familyName: true, gender: true },
    });
    if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [parents, grandparents, spouses, spouseBuckets] = await Promise.all([
      getParents(person.id),
      getGrandparents(person.id),
      getSpouses(person.id),
      getChildrenGroupedBySpouse(person.id),
    ]);

    // after you've loaded: person, parents, grandparents, spouses, spouseBuckets

    // helper to detect "male" across different values: "M", "Male", "m", etc.
    const isMale = (g?: string | null) =>
    (g ?? "").toLowerCase().startsWith("m");

    // pick father from parents (fallback to first parent)
    const father = parents.find(p => isMale(p?.gender)) ?? parents[0] ?? null;

    // pick first son (fallback to first child)
    const firstSon = await prisma.parentChild.findFirst({
    where: {
        parentId: person.id,
        child: { gender: { startsWith: "m", mode: "insensitive" } }, // son
    },
    select: {
        child: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
    orderBy: { id: "asc" },
    });

    const anyChild = await prisma.parentChild.findFirst({
    where: { parentId: person.id },
    select: {
        child: { select: { id: true, givenName: true, familyName: true, gender: true } },
    },
    orderBy: { id: "asc" },
    });

    const downTarget = firstSon?.child ?? anyChild?.child ?? null;

    return NextResponse.json({
    focus: nice(person),
    parents,
    grandparents,
    spouses,
    spouseBuckets,
    nav: {
        up: father ? { id: father.id, name: father.fullName } : null,
        down: downTarget
        ? { id: downTarget.id, name: [downTarget.givenName ?? "", downTarget.familyName ?? ""].join(" ").trim() || "(unknown)" }
        : null,
    },
    });
  } catch (e: any) {
    console.error("GET /api/tree/[id]:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
