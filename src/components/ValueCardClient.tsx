// src/components/ValueCardClient.tsx
"use client";

import { useEffect, useState } from "react";
import { getJSON } from "./_sharedGetJson";
import Spinner from "./Spinner";

function getByPath(obj: any, path?: string) {
  if (!path) return undefined;
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj);
}

export default function ValueCardClient({
  label,
  endpoint,
  path,
  type = "number",
}: {
  label: string;
  endpoint: string;
  path: string;
  type?: "number" | "date" | "text";
}) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getJSON(endpoint, 30000)
      .then((json) => alive && setData(json))
      .catch((e) => alive && setErr(e.message || "Error"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [endpoint]);

  let content: React.ReactNode = "—";
  if (!loading && !err) {
    const v = path === "rows" ? data?.rows : getByPath(data, path);
    if (path === "rows") {
      const want =
        label.toLowerCase().includes("both") ? "both" :
        label.toLowerCase().includes("one")  ? "one"  :
        label.toLowerCase().includes("no")   ? "none" : "";
      const found = Array.isArray(v) ? v.find((r: any) => r.bucket === want) : null;
      content = found?.c ?? "—";
    } else if (v == null) {
      content = "—";
    } else if (type === "number" && typeof v === "number") {
      content = v.toLocaleString();
    } else if (type === "date" && typeof v === "string") {
      content = v.slice(0, 10);
    } else {
      content = String(v);
    }
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold min-h-[1.75rem] flex items-center">
        {loading ? <Spinner size={18} className="text-gray-400" /> :
         err ? <span className="text-red-600 text-sm">{err}</span> :
         content}
      </div>
    </div>
  );
}
