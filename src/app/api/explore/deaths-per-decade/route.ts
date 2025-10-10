// src/app/api/explore/deaths-per-decade/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Array<{ decade: number; count: number }>>`
      SELECT (EXTRACT(YEAR FROM "dod")::int / 10) * 10 AS decade,
             COUNT(*)::int AS count
      FROM "Person" WHERE "dod" IS NOT NULL
      GROUP BY 1 ORDER BY 1
    `;
    return NextResponse.json({ rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
