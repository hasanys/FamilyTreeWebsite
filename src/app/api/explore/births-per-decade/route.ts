// src/app/api/explore/births-per-decade/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL statement_timeout = '5000ms'`;
      return tx.$queryRaw<Array<{ decade: number; count: number }>>`
        SELECT (EXTRACT(YEAR FROM dob)::int/10)*10 AS decade, COUNT(*)::int AS count
        FROM "Person" WHERE dob IS NOT NULL
        GROUP BY 1 ORDER BY 1
      `;
    });
    return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
