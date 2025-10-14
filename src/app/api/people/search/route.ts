export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/people/search?q=...
 * Returns up to 20 people matching query, including recNo, givenName, familyName, dob, dod.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  try {
    if (!q) {
      const rows = await prisma.$queryRawUnsafe<
        {
          id: string;
          recNo: number;
          givenName: string | null;
          familyName: string | null;
          dob: Date | null;
          dod: Date | null;
        }[]
      >(
        `
        select "id","recNo","givenName","familyName","dob","dod"
        from "Person"
        where "givenName" is not null or "familyName" is not null
        order by "familyName" nulls last, "givenName" nulls last, "recNo"
        limit 20
        `
      );

      const shaped = rows.map((row) => ({
        id: row.id,
        recNo: row.recNo,
        givenName: row.givenName,
        familyName: row.familyName,
        dob: row.dob ? row.dob.toISOString().slice(0, 10) : null,
        dod: row.dod ? row.dod.toISOString().slice(0, 10) : null,
      }));

      return NextResponse.json(shaped);
    }

    const like = `%${q}%`;
    const prefix = `${q}%`;

    const rows = await prisma.$queryRawUnsafe<
      {
        id: string;
        recNo: number;
        givenName: string | null;
        familyName: string | null;
        dob: Date | null;
        dod: Date | null;
      }[]
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
        case when "givenName" ilike $2 then 0 else 1 end,
        case when "familyName" ilike $2 then 0 else 1 end,
        "familyName" nulls last,
        "givenName" nulls last,
        "recNo"
      limit 20
      `,
      like,
      prefix
    );

    const shaped = rows.map((row) => ({
      id: row.id,
      recNo: row.recNo,
      givenName: row.givenName,
      familyName: row.familyName,
      dob: row.dob ? row.dob.toISOString().slice(0, 10) : null,
      dod: row.dod ? row.dod.toISOString().slice(0, 10) : null,
    }));

    return NextResponse.json(shaped);
  } catch (e: any) {
    console.error("GET /api/people/search:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
