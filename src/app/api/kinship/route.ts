export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeKinship } from "@/lib/kinship";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    if (!a || !b) return NextResponse.json({ error: "Missing a or b" }, { status: 400 });

    const result = await computeKinship(prisma, a, b);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("/api/kinship error:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
