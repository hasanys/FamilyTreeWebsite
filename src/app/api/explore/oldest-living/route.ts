// src/app/api/explore/oldest-living/route.ts
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
    
    const rows = await prisma.person.findMany({
      where: { alive: true, dob: { not: null } },
      orderBy: { dob: "asc" },
      take: 10,
      select: { id: true, givenName: true, familyName: true, dob: true },
    });
    return NextResponse.json({ rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
