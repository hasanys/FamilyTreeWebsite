import { cookies } from "next/headers";

export function requireAuth() {
  const cookieStore = cookies();
  const authed = cookieStore.get("auth")?.value;

  if (authed !== "true") {
    return false;
  }

  return true;
}
