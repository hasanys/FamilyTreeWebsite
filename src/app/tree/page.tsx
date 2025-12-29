// app/tree/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TreeBoxes from "@/components/TreeBoxes";

function TreePageInner() {
  const searchParams = useSearchParams();
  const DEFAULT_ID = "300";
  const focusId = (searchParams?.get("id") ?? DEFAULT_ID).toString();

  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tree/${focusId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const j = await res.json();
        if (!cancelled) setData(j);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error loading tree");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [focusId]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full border-t-4 border-blue-500 w-12 h-12" />
          <div className="text-gray-600">Loading tree…</div>
        </div>
      )}
      {!loading && error && (
        <div className="text-red-600">Error loading tree: {error}</div>
      )}
      {!loading && data && (
        <>
          {/* Navigation instructions - only show when tree is loaded */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> Click on any family member in the tree view to navigate to their specific family tree. 
              This allows you to move up or down generations and explore different branches of the family.
            </p>
          </div>
          <TreeBoxes data={data} />
        </>
      )}
    </main>
  );
}

export default function Page() {
  // Wrap the component that uses useSearchParams in Suspense
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full border-t-4 border-blue-500 w-12 h-12" />
            <div className="text-gray-600">Loading tree…</div>
          </div>
        </main>
      }
    >
      <TreePageInner />
    </Suspense>
  );
}