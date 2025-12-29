// src/app/api/explore/top-parents/route.ts
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
    
    const grouped = await prisma.parentChild.groupBy({
      by: ["parentId"],
      _count: { parentId: true },
      orderBy: { _count: { parentId: "desc" } },
      take: 10,
    });
    const rows = await Promise.all(grouped.map(async (g) => {
      const p = await prisma.person.findUnique({
        where: { id: g.parentId },
        select: { id: true, givenName: true, familyName: true },
      });
      return { id: p?.id ?? g.parentId, givenName: p?.givenName ?? null, familyName: p?.familyName ?? null, count: g._count.parentId };
    }));
    return NextResponse.json({ rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
