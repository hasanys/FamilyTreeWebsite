// src/app/api/explore/top-countries/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!requireAuth()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
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
