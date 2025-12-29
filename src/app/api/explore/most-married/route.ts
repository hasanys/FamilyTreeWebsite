// src/app/api/explore/most-married/route.ts
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
    const rows = await prisma.$queryRaw<
      Array<{ id: number; givenName: string | null; familyName: string | null; count: number }>
    >`
      WITH mm AS (
        SELECT id,
               ((SELECT COUNT(*) FROM "Marriage" m WHERE m."aId" = p.id) +
                (SELECT COUNT(*) FROM "Marriage" m WHERE m."bId" = p.id))::int AS cnt
        FROM "Person" p
      )
      SELECT p.id, p."givenName", p."familyName", mm.cnt AS count
      FROM mm
      JOIN "Person" p ON p.id = mm.id
      WHERE mm.cnt > 0
      ORDER BY count DESC, p.id ASC
      LIMIT 10
    `;
    return NextResponse.json({ rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
