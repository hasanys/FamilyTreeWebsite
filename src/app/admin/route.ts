import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const pwd = String(form.get("password") ?? "");
  const ok = pwd && process.env.ADMIN_PASSWORD && pwd === process.env.ADMIN_PASSWORD;
  const res = NextResponse.json({ ok });
  if (ok) {
    res.headers.set("Set-Cookie", `admin=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return res;
  }
  return new NextResponse("Unauthorized", { status: 401 });
}
