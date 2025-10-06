export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.parentChild.findMany({
      select: { id: true, parentId: true, childId: true },
    });
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET /api/relationships:", e);
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
