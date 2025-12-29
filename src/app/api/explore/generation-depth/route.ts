// src/app/api/explore/generation-depth/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!requireAuth()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const [row] = await prisma.$queryRaw<Array<{ depth: number | null }>>`
      WITH RECURSIVE
      roots(id) AS (
        SELECT p.id
        FROM "Person" p
        WHERE NOT EXISTS (SELECT 1 FROM "ParentChild" pc WHERE pc."childId" = p.id)
      ),
      seeds(id) AS (
        SELECT id FROM roots
        UNION ALL
        -- fallback if no roots: start from the smallest id
        SELECT (SELECT p2.id FROM "Person" p2 ORDER BY p2.id LIMIT 1)
        WHERE NOT EXISTS (SELECT 1 FROM roots)
      ),
      lineage(id, depth, path) AS (
        SELECT s.id, 1::int, ARRAY[s.id]           -- path is same element type as id
        FROM seeds s
        UNION ALL
        SELECT c."childId",
               lineage.depth + 1,
               path || c."childId"
        FROM lineage
        JOIN "ParentChild" c ON c."parentId" = lineage.id
        WHERE lineage.depth < 50                   -- safety cap
          AND NOT (c."childId" = ANY(path))       -- cycle guard
      )
      SELECT COALESCE(MAX(depth), 0)::int AS depth
      FROM lineage
    `;
    return NextResponse.json({ depth: row?.depth ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
