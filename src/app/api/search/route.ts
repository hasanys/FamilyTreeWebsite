export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json([]);

  // Use raw SQL to match your quoted identifiers
  const rows: Array<{ id: string; givenName: string | null; familyName: string | null }> =
    await prisma.$queryRawUnsafe(
      `select "id","givenName","familyName"
         from "Person"
        where lower(coalesce("givenName",'') || ' ' || coalesce("familyName",''))
              like lower($1)
        order by "familyName","givenName"`,
      `%${q}%`
    );

  const shaped = rows.map(p => ({
    id: p.id,
    fullName: [p.givenName ?? "", p.familyName ?? ""].join(" ").trim(),
  }));
  return NextResponse.json(shaped);
}
