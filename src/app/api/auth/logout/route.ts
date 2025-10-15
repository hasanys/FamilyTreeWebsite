import { NextResponse } from "next/server";

export async function POST() {
  const res = new NextResponse("OK", { status: 200 });
  res.headers.append("Set-Cookie", "ft_auth=; Path=/; Max-Age=0; SameSite=Lax; Secure");
  return res;
}
