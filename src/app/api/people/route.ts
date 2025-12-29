export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    
    // Use raw SQL so we exactly match quoted names in Postgres
    const rows: Array<{ 
      id: string; 
      givenName: string | null; 
      familyName: string | null;
      gender: string | null;
    }> = await prisma.$queryRawUnsafe(
      `select "id","givenName","familyName","gender" from "Person" order by "familyName","givenName"`
    );

    const shaped = rows.map((p) => ({
      id: p.id,
      fullName: [p.givenName ?? "", p.familyName ?? ""].join(" ").trim(),
      gender: p.gender // Added for tree visualization
    }));
    return NextResponse.json(shaped);
  } catch (e: any) {
    console.error("GET /api/people:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // accept {givenName,familyName} or {fullName}
    let given = body.givenName ?? "";
    let family = body.familyName ?? "";
    if (!given && !family && typeof body.fullName === "string") {
      const parts = body.fullName.trim().split(/\s+/);
      given = parts.slice(0, -1).join(" ") || parts[0] || "";
      family = parts.length > 1 ? parts.at(-1)! : "";
    }

    // Use raw SQL to respect quoted identifiers
    const created =
      await prisma.$queryRawUnsafe<{ id: string }[]>(
        `insert into "Person" ("id","givenName","familyName","createdAt","updatedAt")
         values (gen_random_uuid(), $1, $2, now(), now())
         returning "id"`,
        given, family
      );

    return NextResponse.json({ id: created[0].id, givenName: given, familyName: family }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/people:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}