"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TreeBoxes from "@/components/TreeBoxes";

export default function TreePageClientWrapper() {
  const searchParams = useSearchParams();
  const idParam = searchParams?.get("id");
  const DEFAULT_ID = "300";
  const focusId = idParam ? idParam.toString() : DEFAULT_ID;

  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTree() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tree/${focusId}`, { cache: "no-store" });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`Failed to load tree: ${msg}`);
        }
        const j = await res.json();
        setData(j);
      } catch (e: any) {
        console.error("Error fetching tree:", e);
        setError(e.message || "Error");
      } finally {
        setLoading(false);
      }
    }
    fetchTree();
  }, [focusId]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full border-t-4 border-blue-500 w-12 h-12"></div>
          <div className="text-gray-600">Loading tree…</div>
        </div>
      )}

      {!loading && error && (
        <div className="text-red-600">Error loading tree: {error}</div>
      )}
      
      {!loading && data && <TreeBoxes data={data} />}
    </main>
  );
}
