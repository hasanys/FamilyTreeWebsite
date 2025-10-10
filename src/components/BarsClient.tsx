// src/components/BarsClient.tsx
"use client";

import { useEffect, useState } from "react";
import { getJSON } from "./_sharedGetJson";
import Spinner from "./Spinner";

export default function BarsClient({ endpoint }: { endpoint: string }) {
  const [rows, setRows] = useState<Array<{ label: string; count: number }>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getJSON(endpoint, 30000)
      .then((json) => {
        if (!alive) return;
        const r = (json?.rows ?? []).map((x: any) => ({
          label: x.label ?? `${x.decade}s`,
          count: Number(x.count) || 0,
        }));
        setRows(r);
      })
      .catch((e) => alive && setErr(e.message || "Error"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [endpoint]);

  if (loading) return <Spinner size={18} className="text-gray-400" />;
  if (err) return <div className="text-red-600 text-sm">{err}</div>;
  if (!rows.length) return <div className="text-gray-500 text-sm">No data.</div>;

  const max = Math.max(...rows.map((x) => x.count), 1);

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = Math.max(2, Math.round((r.count / max) * 100));
        return (
          <div key={r.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm">
            <div className="text-gray-600">{r.label}</div>
            <div className="h-3 rounded bg-gray-100">
              <div className="h-3 rounded bg-gray-400/60" style={{ width: `${pct}%` }} />
            </div>
            <div className="tabular-nums text-gray-700">{r.count}</div>
          </div>
        );
      })}
    </div>
  );
}
