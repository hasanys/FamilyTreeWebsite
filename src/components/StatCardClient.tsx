// src/components/StatCardClient.tsx
"use client";

import { useEffect, useState } from "react";

export default function StatCardClient({
  label,
  endpoint,
  render,
}: {
  label: string;
  endpoint: string; // e.g. /api/explore/basic
  render: (data: any) => React.ReactNode; // how to render JSON
}) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15000); // 15s client timeout

    fetch(endpoint, { signal: ac.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((json) => setData(json))
      .catch((e) => setErr(e.message || "Error"))
      .finally(() => {
        clearTimeout(t);
        setLoading(false);
      });

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [endpoint]);

  return (
    <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {loading ? (
          <span className="animate-pulse text-gray-400">…</span>
        ) : err ? (
          <span className="text-red-600 text-sm">{err}</span>
        ) : (
          render(data)
        )}
      </div>
    </div>
  );
}
