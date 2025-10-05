export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const edges: Array<{ id: string; parentId: string; childId: string }> =
      await prisma.$queryRawUnsafe(`select "id","parentId","childId" from "ParentChild"`);
    return NextResponse.json(edges);
  } catch (e: any) {
    console.error("GET /api/relationships:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
