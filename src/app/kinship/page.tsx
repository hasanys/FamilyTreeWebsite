"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RelationExplainer from "@/components/RelationExplainer";

type PersonRow = {
  id: string;
  recNo: number | null;
  givenName: string | null;
  familyName: string | null;
  dob: string | null;
  dod: string | null;
};

function fullName(p?: { givenName: string | null; familyName: string | null }) {
  if (!p) return "";
  return [p.givenName ?? "", p.familyName ?? ""].join(" ").trim();
}

function useDebounced<T>(value: T, delay = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

async function searchPeople(term: string): Promise<PersonRow[]> {
  if (!term.trim()) return [];
  const r = await fetch(`/api/people/search?q=${encodeURIComponent(term)}`, {
    cache: "no-store",
  });
  if (!r.ok) return [];
  return r.json();
}

export default function KinshipPage() {
  const [a, setA] = useState<PersonRow | null>(null);
  const [b, setB] = useState<PersonRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ relation: string; direction?: string } | null>(null);
  const [computedA, setComputedA] = useState<PersonRow | null>(null);
  const [computedB, setComputedB] = useState<PersonRow | null>(null);

  const canCompute = a && b && a.id !== b.id;

  const compute = async () => {
    if (!a || !b) return;
    setLoading(true);
    setResult(null);
    try {
      const url = `/api/kinship?a=${encodeURIComponent(a.id)}&b=${encodeURIComponent(b.id)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setResult(data);
      setComputedA(a);
      setComputedB(b);
    } catch (e) {
      console.error(e);
      setResult({ relation: "Error computing relationship" });
      setComputedA(a);
      setComputedB(b);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-4xl mb-3">Kinship Finder</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>⚠️ Note:</strong> The relation finder may not be completely accurate. 
          Use this data at your own discretion. This feature is still a work in progress and 
          results should be verified independently.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-4">
        <PersonPicker label="From person" value={a} onPick={setA} />
        <PersonPicker label="To person" value={b} onPick={setB} />
      </div>

      <div className="mb-6">
        <button
          className="btn"
          disabled={!canCompute || loading}
          onClick={compute}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
              Computing…
            </span>
          ) : (
            "Compute"
          )}
        </button>
      </div>

      <section className="rounded-2xl border bg-white/70 p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-3">Result</h2>

        {!result && <div className="text-gray-500">Pick two people and click Compute.</div>}

        {result && computedA && computedB && (
          <div className="space-y-4">
            {/* Relation summary label with explanation */}
            <div>
              <div className="text-lg font-semibold mb-1">{result.relation}</div>
              <RelationExplainer 
                relation={result.relation}
                person1Name={fullName(computedA) || "Person 1"}
                person2Name={fullName(computedB) || "Person 2"}
              />
            </div>

            {/* Human-readable sentence */}
            <div className="text-lg text-gray-800">
              <RelationSentence a={computedA} b={computedB} result={result} />
            </div>

            {/* Link to tree view */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                View details on this relation by exploring the tree view:
              </p>
              <div className="flex gap-3">
                <Link
                  href={`/tree?id=${computedA.id}`}
                  className="text-blue-700 hover:underline text-sm"
                >
                  View {fullName(computedA) || "(Person A)"}'s tree →
                </Link>
                <Link
                  href={`/tree?id=${computedB.id}`}
                  className="text-blue-700 hover:underline text-sm"
                >
                  View {fullName(computedB) || "(Person B)"}'s tree →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function RelationSentence({
  a,
  b,
  result,
}: {
  a: PersonRow;
  b: PersonRow;
  result: { relation: string; direction?: string };
}) {
  const A = (
    <Link className="text-blue-700 hover:underline" href={`/person/${a.id}`}>
      {fullName(a) || "(No name)"}
    </Link>
  );
  const B = (
    <Link className="text-blue-700 hover:underline" href={`/person/${b.id}`}>
      {fullName(b) || "(No name)"}
    </Link>
  );

  const label = result.relation.toLowerCase();

  if (label.includes("sibling")) return <>{A} is a sibling of {B}.</>;
  if (result.direction === "A_parent_of_B") return <>{A} is a parent of {B}.</>;
  if (result.direction === "B_parent_of_A") return <>{B} is a parent of {A}.</>;
  if (label.includes("spouse")) return <>{A} and {B} are spouses.</>;

  return <>{A} is related to {B} as {result.relation.toLowerCase()}.</>;
}

function PersonPicker({
  label,
  value,
  onPick,
}: {
  label: string;
  value: PersonRow | null;
  onPick: (p: PersonRow | null) => void;
}) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 200);
  const [opts, setOpts] = useState<PersonRow[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    if (!debouncedQ.trim()) {
      setOpts([]);
      return;
    }
    (async () => {
      try {
        const res = await searchPeople(debouncedQ);
        setOpts(res);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => controller.abort();
  }, [debouncedQ]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-sm mb-1">{label}</label>
      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder={value ? fullName(value) : "Type a name or record #"}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && opts.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow max-h-80 overflow-y-auto">
          {opts.map((p) => {
            const name = fullName(p) || "(No name)";
            return (
              <button
                key={p.id}
                onClick={() => {
                  onPick(p);
                  setQ(name);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">
                    {name}{" "}
                    {p.recNo ? (
                      <span className="text-gray-500">({p.recNo})</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.dob ?? "—"} — {p.dod ?? "—"}
                  </div>
                </div>
                <Link
                  href={`/person/${p.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-700 text-sm hover:underline"
                >
                  open
                </Link>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}