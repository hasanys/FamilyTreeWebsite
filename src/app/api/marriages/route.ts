export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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