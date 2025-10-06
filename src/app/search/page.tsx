"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Person = { id: string; fullName: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch(term: string) {
    setLoading(true);
    const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
    setResults(await r.json());
    setLoading(false);
  }

  useEffect(() => { if (q.trim().length >= 2) runSearch(q); else setResults([]); }, [q]);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Search Person</h1>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Type a name…"
        className="w-full rounded-xl border px-4 py-2"
      />
      {loading && <div className="text-sm text-gray-600">Searching…</div>}
      <ul className="divide-y rounded-xl border bg-white/70">
        {results.map((p) => (
          <li key={p.id} className="p-3 flex items-center justify-between">
            {/* clickable name → person detail page */}
            <a
              href={`/person/${p.id}`}
              className="text-blue-800 hover:underline text-lg font-medium"
            >
              {p.fullName}
            </a>

            {/* optional tree link on the right */}
            <a
              href={`/tree?focus=${p.id}`}
              className="text-sm text-blue-700 hover:underline"
            >
              View tree
            </a>
          </li>
        ))}

        {!loading && results.length === 0 && q && (
          <li className="p-3 text-sm text-gray-600">No matches</li>
        )}
      </ul>

    </div>
  );
}
