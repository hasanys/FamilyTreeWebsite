// src/app/api/explore/lifespan/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vals = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL statement_timeout = '5000ms'`;
      const rows = await tx.$queryRaw<Array<{ years: unknown }>>`
        SELECT EXTRACT(EPOCH FROM (dod - dob))/31557600.0 AS years
        FROM "Person" WHERE dob IS NOT NULL AND dod IS NOT NULL AND dod > dob
      `;
      return rows
        .map((r) => Number(r.years))
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= 130)
        .sort((a, b) => a - b);
    });

    const avg =
      vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1) : null;
    const med =
      vals.length === 0
        ? null
        : Math.round(
            (vals.length % 2
              ? vals[(vals.length - 1) / 2]
              : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2) * 1
          );
    const max = vals.length ? Math.round(vals[vals.length - 1]) : null;

    return NextResponse.json({ avg, med, max }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
