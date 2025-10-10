// src/app/api/explore/hijri-coverage/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Array<{ kind:string; c:number }>>`
      SELECT 'dob_hijri' AS kind, COUNT(*)::int FROM "Person" WHERE "dobHijri" IS NOT NULL
      UNION ALL
      SELECT 'dod_hijri', COUNT(*)::int FROM "Person" WHERE "dodHijri" IS NOT NULL
    `;
    const map = Object.fromEntries(rows.map(r => [r.kind, r.c]));
    return NextResponse.json({ map });
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? "error" }, { status: 500 });
  }
}
