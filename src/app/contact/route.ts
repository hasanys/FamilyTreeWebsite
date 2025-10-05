import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const form = await req.formData();
  console.log("CONTACT FORM", Object.fromEntries(form.entries()));
  return NextResponse.json({ ok: true });
}
