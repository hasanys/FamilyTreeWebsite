export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {

  if (!requireAuth()) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json([]);

  // Include names + dob + dod
  const rows: Array<{
    id: string;
    givenName: string | null;
    familyName: string | null;
    dob: Date | null;
    dod: Date | null;
  }> = await prisma.$queryRawUnsafe(
    `select "id","givenName","familyName","dob","dod"
       from "Person"
      where lower(coalesce("givenName",'') || ' ' || coalesce("familyName",''))
            like lower($1)
      order by "familyName","givenName"`,
    `%${q}%`
  );

  const shaped = rows.map((p) => ({
    id: p.id,
    fullName: [p.givenName ?? "", p.familyName ?? ""].join(" ").trim(),
    dob: p.dob ? p.dob.toISOString().slice(0, 10) : null,
    dod: p.dod ? p.dod.toISOString().slice(0, 10) : null,
  }));

  return NextResponse.json(shaped);
}
