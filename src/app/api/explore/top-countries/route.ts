// src/app/api/explore/top-countries/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Array<{ country: string; count: number }>>`
      SELECT country, COUNT(*)::int AS count
      FROM "Person"
      WHERE country IS NOT NULL AND length(country)>0
      GROUP BY country
      ORDER BY count DESC, country ASC
      LIMIT 15
    `;
    return NextResponse.json({ rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
