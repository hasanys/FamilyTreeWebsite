// src/app/api/explore/basic/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [row] = await prisma.$queryRaw<Array<{
      total_people: number; alive_count: number; with_dob: number; with_dod: number; total_marriages: number;
    }>>`
      SELECT
        (SELECT COUNT(*) FROM "Person")::int AS total_people,
        (SELECT COUNT(*) FROM "Person" WHERE alive)::int AS alive_count,
        (SELECT COUNT(*) FROM "Person" WHERE dob IS NOT NULL)::int AS with_dob,
        (SELECT COUNT(*) FROM "Person" WHERE dod IS NOT NULL)::int AS with_dod,
        (SELECT COUNT(*) FROM "Marriage")::int AS total_marriages
    `;
    const oldest = await prisma.person.findFirst({
      where: { dob: { not: null } }, orderBy: { dob: "asc" },
      select: { id: true, givenName: true, familyName: true, dob: true },
    });
    const newest = await prisma.person.findFirst({
      where: { dob: { not: null } }, orderBy: { dob: "desc" },
      select: { id: true, givenName: true, familyName: true, dob: true },
    });
    return NextResponse.json({ basic: row, oldest, newest }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 });
  }
}
