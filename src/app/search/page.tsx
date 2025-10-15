"use client";
import { useEffect, useState } from "react";

type Person = {
  id: string;
  recNo?: number;
  givenName: string | null;
  familyName: string | null;
  dob?: string | null;
  dod?: string | null;
};

function fullName(p: { givenName: string | null; familyName: string | null }) {
  return [p.givenName ?? "", p.familyName ?? ""].join(" ").trim();
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch(term: string) {
    setLoading(true);
    const r = await fetch(`/api/people/search?q=${encodeURIComponent(term)}`);
    const data = await r.json();
    setResults(data);
    setLoading(false);
  }

  useEffect(() => {
    if (q.trim().length >= 2) {
      runSearch(q);
    } else {
      setResults([]);
    }
  }, [q]);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Search Person</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type a name…"
        className="w-full rounded-xl border px-4 py-2"
      />
      {loading && <div className="text-sm text-gray-600">Searching…</div>}
      <ul className="divide-y rounded-xl border bg-white/70">
        {results.map((p) => (
          <li key={p.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <a
                href={`/person/${p.id}`}
                className="text-blue-800 hover:underline text-lg font-medium"
              >
                {fullName(p) || "(No Name)"}
              </a>
              <div className="text-sm text-gray-600 mt-1">
                {p.dob && <span>DOB: {p.dob}</span>}
                {p.dod && <span className="ml-2">DOD: {p.dod}</span>}
              </div>
            </div>

            <a
              href={`/tree?id=${p.id}`}
              className="text-sm text-blue-700 hover:underline mt-2 sm:mt-0"
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
