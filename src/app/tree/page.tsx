// app/tree/page.tsx
export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import TreeBoxes from "@/components/TreeBoxes"; // <- new component

const DEFAULT_ID = "300";

async function getTreeData(id: string) {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/tree/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to load tree for ${id}${msg ? `: ${msg}` : ""}`);
  }
  return res.json();
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { id?: string };
}) {
  const focusId = (searchParams?.id ?? DEFAULT_ID).toString();
  const data = await getTreeData(focusId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <TreeBoxes data={data} />
    </main>
  );
}
