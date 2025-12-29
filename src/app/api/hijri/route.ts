import { NextRequest } from "next/server";
import { formatHijriFromISO } from "@/lib/hijri";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    if (!requireAuth()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

  const { searchParams } = new URL(req.url);
  const iso = searchParams.get("date"); // YYYY-MM-DD
  if (!iso) return new Response("Missing ?date=YYYY-MM-DD", { status: 400 });

  const formatted = formatHijriFromISO(iso);
  if (!formatted) return new Response("Unable to format date", { status: 422 });

  return Response.json({ hijri: formatted });
}

// Optional, but allowed:
export const runtime = "edge"; // or "nodejs"
