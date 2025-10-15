import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  const ok = typeof password === "string" && password === process.env.SITE_PASSWORD;

  if (!ok) {
    return new NextResponse("Invalid password", { status: 401 });
  }

  const res = new NextResponse("OK", { status: 200 });
  // Non-HttpOnly so the client can read; short-lived
  res.headers.append(
    "Set-Cookie",
    `ft_auth=1; Path=/; Max-Age=${60 * 60 * 12}; SameSite=Lax; Secure`
  );
  return res;
}
