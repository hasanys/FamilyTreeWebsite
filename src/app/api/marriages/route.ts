export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    if (!requireAuth()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
        
    const marriages = await prisma.marriage.findMany({
      select: { 
        id: true, 
        aId: true, 
        bId: true,
        start: true,
        nikahType: true 
      },
    });
    return NextResponse.json(marriages);
  } catch (e: any) {
    console.error("GET /api/marriages:", e);
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}