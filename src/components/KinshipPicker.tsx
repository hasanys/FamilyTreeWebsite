"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = { id: string; recNo: number | null; name: string; dob: string | null };

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function SearchBox({
  label,
  nameId,       // form field for the selected id
  nameQuery,    // form field for the visible query
  defaultId = "",
  defaultQuery = "",
}: {
  label: string;
  nameId: string;
  nameQuery: string;
  defaultId?: string;
  defaultQuery?: string;
}) {
  const [query, setQuery] = useState(defaultQuery);
  const [selectedId, setSelectedId] = useState(defaultId);
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounced(query, 250);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!debounced) {
      setOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/people/search?q=${encodeURIComponent(debounced)}`, { cache: "no-store" });
        const data: Option[] = await res.json();
        if (!cancelled) setOptions(data);
        setOpen(true);
      } catch {
        if (!cancelled) setOptions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced]);

  // close dropdown when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedLabel = useMemo(() => {
    const opt = options.find(o => o.id === selectedId);
    return opt?.name ?? query;
  }, [options, selectedId, query]);

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-sm text-gray-600 mb-1">{label}</label>

      {/* visible search input */}
      <input
        className="w-full border rounded px-3 py-2"
        name={nameQuery}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setSelectedId(""); setOpen(true); }}
        onFocus={() => query && setOpen(true)}
        placeholder="Type a name..."
        autoComplete="off"
      />

      {/* hidden input that actually carries the selected id */}
      <input type="hidden" name={nameId} value={selectedId} />

      {/* dropdown */}
      {open && options.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-lg border bg-white shadow">
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onClick={() => {
                  setSelectedId(o.id);
                  setQuery(o.name);
                  setOpen(false);
                }}
              >
                <div className="flex justify-between gap-3">
                  <div className="truncate">
                    <span className="font-medium">{o.name}</span>{" "}
                    <span className="text-gray-500">({o.recNo ?? "—"})</span>
                  </div>
                  <div className="text-xs text-gray-500">{o.dob ?? "—"}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* helper chip if selected */}
      {selectedId && (
        <div className="mt-1 text-xs text-gray-600">
          Selected ID: <code className="px-1 py-0.5 bg-gray-100 rounded">{selectedId}</code>
        </div>
      )}
    </div>
  );
}

export default function KinshipPicker({
  initialA = "",
  initialB = "",
  initialQ = "",
  initialQ2 = "",
}: {
  initialA?: string;
  initialB?: string;
  initialQ?: string;
  initialQ2?: string;
}) {
  return (
    <form className="rounded-2xl border bg-white/70 p-5 shadow-sm space-y-4" method="get" action="/kinship">
      <div className="grid sm:grid-cols-2 gap-4">
        <SearchBox label="From person" nameId="a" nameQuery="q" defaultId={initialA} defaultQuery={initialQ} />
        <SearchBox label="To person"   nameId="b" nameQuery="q2" defaultId={initialB} defaultQuery={initialQ2} />
      </div>

      <div className="flex gap-3">
        <button className="btn" type="submit">Compute</button>
      </div>
    </form>
  );
}
