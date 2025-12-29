// src/app/api/explore/top-surnames/route.ts
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
    const grouped = await prisma.person.groupBy({
      by: ["familyName"],
      where: { familyName: { not: null } },
      _count: { familyName: true },
      orderBy: { _count: { familyName: "desc" } },
      take: 10,
    });
    const rows = grouped.map((r) => ({ familyName: r.familyName as string, count: r._count.familyName }));
    return NextResponse.json({ rows });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
