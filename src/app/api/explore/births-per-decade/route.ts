// src/app/api/explore/births-per-decade/route.ts
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
