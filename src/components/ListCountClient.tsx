// src/components/ListCountClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJSON } from "./_sharedGetJson";
import Spinner from "./Spinner";

// very small mustache-ish templating: {{field}} or {{field|date}}
function renderTemplate(tpl: string, row: any) {
  return tpl.replace(/\{\{\s*([^}|]+)\s*(\|\s*date\s*)?\}\}/g, (_, field, isDate) => {
    const v = row?.[field];
    if (v == null) return "";
    if (isDate) return String(v).slice(0, 10);
    return String(v);
  }).replace(/\s+/g, " ").trim();
}

export default function ListCountClient({
  endpoint,
  labelTemplate,
  linkBase = "/person",
  idKey = "id",
  countKey,
  emptyText = "No data.",
}: {
  endpoint: string;
  labelTemplate: string;
  linkBase?: string;
  idKey?: string;
  countKey?: string;
  emptyText?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getJSON(endpoint, 30000)
      .then((json) => alive && setRows(Array.isArray(json?.rows) ? json.rows : []))
      .catch((e) => alive && setErr(e.message || "Error"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [endpoint]);

  if (loading) return <Spinner size={18} className="text-gray-400" />;
  if (err) return <div className="text-red-600 text-sm">{err}</div>;
  if (!rows.length) return <div className="text-gray-500 text-sm">{emptyText}</div>;

  return (
    <ol className="space-y-1 list-decimal ml-5">
      {rows.map((r, i) => {
        const id = r?.[idKey as string] ?? i;
        const label = renderTemplate(labelTemplate, r) || "(Unknown)";
        const right = countKey ? r?.[countKey] : null;
        const content = linkBase
          ? <Link className="text-blue-700 hover:underline truncate" href={`${linkBase}/${r?.[idKey as string]}`}>{label}</Link>
          : <span className="truncate">{label}</span>;
        return (
          <li key={id} className="flex items-center justify-between">
            {content}
            {countKey ? <span className="tabular-nums text-gray-600">{right ?? "—"}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
