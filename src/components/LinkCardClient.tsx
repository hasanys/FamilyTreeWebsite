// src/components/LinkCardClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJSON } from "./_sharedGetJson";
import Spinner from "./Spinner";

function getByPath(obj: any, path?: string) {
  if (!path) return undefined;
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj);
}
function fullName(g?: string | null, f?: string | null) {
  return [g ?? "", f ?? ""].join(" ").trim() || "(Unknown)";
}

export default function LinkCardClient({
  label, endpoint, idPath, givenPath, familyPath, datePath,
}: {
  label: string;
  endpoint: string;
  idPath: string;
  givenPath: string;
  familyPath: string;
  datePath?: string;
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
    const id = getByPath(data, idPath);
    const given = getByPath(data, givenPath);
    const family = getByPath(data, familyPath);
    const date = datePath ? getByPath(data, datePath) : undefined;
    if (id != null) {
      content = (
        <Link className="text-blue-700 hover:underline" href={`/person/${id}`}>
          {date ? `${String(date).slice(0, 10)} — ` : ""}
          {fullName(given, family)}
        </Link>
      );
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
