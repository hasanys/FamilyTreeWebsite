import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Single query, no transaction. Uses subselect—fast with indexes on ParentChild(childId).
    const rows = await prisma.$queryRaw<Array<{ bucket: string; c: number }>>`
      WITH counts AS (
        SELECT p.id,
               COALESCE( (SELECT COUNT(*) FROM "ParentChild" pc WHERE pc."childId" = p.id), 0 ) AS n
        FROM "Person" p
      )
      SELECT 'both'::text AS bucket, COUNT(*)::int AS c FROM counts WHERE n = 2
      UNION ALL
      SELECT 'one'::text  AS bucket, COUNT(*)::int AS c FROM counts WHERE n = 1
      UNION ALL
      SELECT 'none'::text AS bucket, COUNT(*)::int AS c FROM counts WHERE n = 0
    `;
    return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
