// src/app/api/explore/anomalies/route.ts
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
    
    const rows = await prisma.$queryRaw<Array<{ kind: string; c: number }>>`
      SELECT 'dod_before_dob' AS kind, COUNT(*)::int AS c
      FROM "Person" WHERE dob IS NOT NULL AND dod IS NOT NULL AND dod < dob
      UNION ALL
      SELECT 'dob_in_future', COUNT(*)::int FROM "Person" WHERE dob > NOW()
      UNION ALL
      SELECT 'missing_name', COUNT(*)::int
      FROM "Person"
      WHERE (COALESCE("givenName",'')='' AND COALESCE("familyName",'')='')
    `;
    const map = Object.fromEntries(rows.map(r => [r.kind, r.c]));
    return NextResponse.json({ map });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
