// src/app/api/people/search/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/people/search?q=ali
 * Returns top 20 people whose name (given/family in any order) or recNo matches.
 * Also normalizes dates to YYYY-MM-DD strings for display.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  try {
    // If no query, return a sensible default list (named people first)
    if (!q) {
      const rows = await prisma.$queryRawUnsafe<
        { id: string; recNo: number; givenName: string | null; familyName: string | null; dob: Date | null; dod: Date | null; }[]
      >(
        `
        select "id","recNo","givenName","familyName","dob","dod"
        from "Person"
        where "givenName" is not null or "familyName" is not null
        order by "familyName" nulls last, "givenName" nulls last, "recNo"
        limit 20
        `
      );

      return NextResponse.json(rows.map(row => ({
        id: row.id,
        recNo: row.recNo,
        givenName: row.givenName,
        familyName: row.familyName,
        dob: row.dob ? row.dob.toISOString().slice(0,10) : null,
        dod: row.dod ? row.dod.toISOString().slice(0,10) : null,
      })));
    }

    // Query with flexible matching:
    //  - "given family" contains q
    //  - "family given" contains q
    //  - recNo contains q
    const like = `%${q}%`;
    const prefix = `${q}%`;

    const rows = await prisma.$queryRawUnsafe<
      { id: string; recNo: number; givenName: string | null; familyName: string | null; dob: Date | null; dod: Date | null; }[]
    >(
      `
      select "id","recNo","givenName","familyName","dob","dod"
      from "Person"
      where
        (
          (coalesce("givenName",'') || ' ' || coalesce("familyName",'')) ilike $1
          or (coalesce("familyName",'') || ' ' || coalesce("givenName",'')) ilike $1
          or ("recNo"::text ilike $1)
        )
      order by
        -- prioritize prefix matches on either name part
        case when "givenName" ilike $2 then 0 else 1 end,
        case when "familyName" ilike $2 then 0 else 1 end,
        "familyName" nulls last,
        "givenName" nulls last,
        "recNo"
      limit 20
      `,
      like, prefix
    );

    return NextResponse.json(rows.map(row => ({
      id: row.id,
      recNo: row.recNo,
      givenName: row.givenName,
      familyName: row.familyName,
      dob: row.dob ? row.dob.toISOString().slice(0,10) : null,
      dod: row.dod ? row.dod.toISOString().slice(0,10) : null,
    })));
  } catch (e: any) {
    console.error("GET /api/people/search:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
