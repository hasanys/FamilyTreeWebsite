// src/app/api/explore/living-countries/route.ts
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
    
    // Try PascalCase "Country" first (if your table really has that exact quoted column)
    try {
      const rows = await prisma.$queryRaw<Array<{ Country: string; count: number }>>`
        SELECT "Country", COUNT(*)::int AS count
        FROM "Person"
        WHERE alive = true
          AND "Country" IS NOT NULL
          AND length("Country") > 0
        GROUP BY "Country"
        ORDER BY count DESC, "Country" ASC
        LIMIT 15
      `;
      return NextResponse.json({ rows });
    } catch {
      // Fallback: lowercase country (common in your other queries)
      const rows = await prisma.$queryRaw<Array<{ country: string; count: number }>>`
        SELECT country, COUNT(*)::int AS count
        FROM "Person"
        WHERE alive = true
          AND country IS NOT NULL
          AND length(country) > 0
        GROUP BY country
        ORDER BY count DESC, country ASC
        LIMIT 15
      `;
      // normalize shape to { Country, count } so the client template {{Country}} works
      const norm = rows.map(r => ({ Country: (r as any).country, count: r.count }));
      return NextResponse.json({ rows: norm });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
