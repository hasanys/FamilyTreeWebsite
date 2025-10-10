// Server-only helpers to compute relationships using ancestor depths
import { PrismaClient } from "@prisma/client";

export type KinshipResult = {
  relation: string;
  details: {
    lcaId?: string;              // lowest common ancestor (if any)
    upFromA?: number;            // generations A→LCA
    upFromB?: number;            // generations B→LCA
    pathNote?: string;           // brief note (e.g., "share a parent", "spouses")
  };
};

async function parentsOf(prisma: PrismaClient, id: string) {
  const rows = await prisma.parentChild.findMany({
    where: { childId: id },
    select: { parentId: true },
  });
  return rows.map(r => r.parentId);
}

async function spousesOf(prisma: PrismaClient, id: string) {
  const rows = await prisma.marriage.findMany({
    where: { OR: [{ aId: id }, { bId: id }] },
    select: { aId: true, bId: true },
  });
  const s = new Set<string>();
  for (const r of rows) s.add(r.aId === id ? r.bId : r.aId);
  return [...s];
}

/** Ancestors with depth: 1 = parent, 2 = grandparent, ... */
async function ancestorsWithDepth(prisma: PrismaClient, id: string, maxDepth = 15) {
  // Recursive CTE for speed & one roundtrip
  const rows: Array<{ ancestor_id: string; depth: number }> = await prisma.$queryRawUnsafe(
    `
    WITH RECURSIVE anc(person_id, ancestor_id, depth) AS (
      SELECT $1::text, pc."parentId", 1
      FROM "ParentChild" pc
      WHERE pc."childId" = $1
      UNION ALL
      SELECT a.person_id, pc."parentId", a.depth + 1
      FROM anc a
      JOIN "ParentChild" pc ON pc."childId" = a.ancestor_id
      WHERE a.depth < $2
    )
    SELECT ancestor_id, depth FROM anc
    `,
    id, maxDepth
  );
  return rows;
}

function ordinal(n: number) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v-20)%10] || s[v] || "th");
}

function cousinLabel(upA: number, upB: number): string {
  // Based on LCA depths (>=1 each)
  const k = Math.min(upA, upB) - 1;       // cousin degree
  const removed = Math.abs(upA - upB);    // removed count
  if (k <= 0) {
    // siblings handled elsewhere; but if we get here, default to "close relatives"
    return removed ? `sibling (once/twice removed?)` : "sibling";
  }
  const base = `${ordinal(k)} cousin`;
  return removed ? `${base} ${removed === 1 ? "once" : removed === 2 ? "twice" : `${removed} times`} removed` : base;
}

export async function computeKinship(prisma: PrismaClient, aId: string, bId: string): Promise<KinshipResult> {
  if (aId === bId) return { relation: "Same person", details: {} };

  // spouses?
  const [aSp, bSp] = await Promise.all([spousesOf(prisma, aId), spousesOf(prisma, bId)]);
  if (aSp.some(x => x === bId)) {
    return { relation: "Spouses", details: { pathNote: "Direct marriage" } };
  }

  // parents / children (direct line)
  const [aParents, bParents] = await Promise.all([parentsOf(prisma, aId), parentsOf(prisma, bId)]);
  if (aParents.includes(bId)) return { relation: "Parent ↔ Child", details: { pathNote: "B is a parent of A" } };
  if (bParents.includes(aId)) return { relation: "Parent ↔ Child", details: { pathNote: "A is a parent of B" } };

  // siblings (share at least one parent)
  if (aParents.some(p => bParents.includes(p))) {
    return { relation: "Siblings", details: { pathNote: "Share a parent" } };
  }

  // ancestors (multi-generation line)
  const [ancA, ancB] = await Promise.all([
    ancestorsWithDepth(prisma, aId, 20),
    ancestorsWithDepth(prisma, bId, 20),
  ]);
  const mapA = new Map(ancA.map(r => [r.ancestor_id, r.depth]));
  const mapB = new Map(ancB.map(r => [r.ancestor_id, r.depth]));

  // If one is ancestor of the other (depth undefined means "not an ancestor")
  if (mapA.has(bId)) {
    return { relation: `${"Great-".repeat(Math.max(0, mapA.get(bId)! - 2))}${mapA.get(bId) === 1 ? "Parent" : mapA.get(bId) === 2 ? "Grandparent" : "Great-Grandparent"} ↔ Descendant`, details: { pathNote: "B is ancestor of A" } };
  }
  if (mapB.has(aId)) {
    return { relation: `${"Great-".repeat(Math.max(0, mapB.get(aId)! - 2))}${mapB.get(aId) === 1 ? "Parent" : mapB.get(aId) === 2 ? "Grandparent" : "Great-Grandparent"} ↔ Descendant`, details: { pathNote: "A is ancestor of B" } };
  }

  // Find a lowest common ancestor (minimize max(depthA, depthB), then sum)
  let best: { lca: string; da: number; db: number } | null = null;
  for (const [anc, da] of mapA.entries()) {
    const db = mapB.get(anc);
    if (db === undefined) continue;
    if (!best) best = { lca: anc, da, db };
    else {
      const curScore = Math.max(da, db) * 100 + (da + db); // lexicographic: minimize max depth, then sum
      const bestScore = Math.max(best.da, best.db) * 100 + (best.da + best.db);
      if (curScore < bestScore) best = { lca: anc, da, db };
    }
  }

  if (best) {
    const label = cousinLabel(best.da, best.db);
    return { relation: label, details: { lcaId: best.lca, upFromA: best.da, upFromB: best.db, pathNote: "Computed via LCA" } };
  }

  // If no LCA via parent links (disconnected components), try an in-law check quickly:
  if (aSp.some(x => bParents.includes(x)) || bSp.some(x => aParents.includes(x))) {
    return { relation: "In-laws (via marriage link)", details: { pathNote: "Spouse shares parent/child with other" } };
  }

  return { relation: "No known blood/marital relation in data", details: {} };
}
