"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "reactflow/dist/style.css";

// Render React Flow only on the client (avoid SSR mismatch)
const ReactFlow  = dynamic(() => import("reactflow").then(m => m.default), { ssr: false });
const Background = dynamic(() => import("reactflow").then(m => m.Background), { ssr: false });
const Controls   = dynamic(() => import("reactflow").then(m => m.Controls),   { ssr: false });
const MiniMap    = dynamic(() => import("reactflow").then(m => m.MiniMap),    { ssr: false });

type Person = { id: string; fullName: string };
type Edge   = { id: string; parentId: string; childId: string };

export default function Tree() {
  const [mounted, setMounted] = useState(false);
  const [people, setPeople]   = useState<Person[]>([]);
  const [edges, setEdges]     = useState<Edge[]>([]);
  const [err, setErr]         = useState<string | null>(null);

  // mark client-mount (don’t branch hooks on this)
  useEffect(() => { setMounted(true); }, []);

  // fetch data
  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([
          fetch("/api/people").then(res => { if (!res.ok) throw new Error(`/api/people ${res.status}`); return res.json(); }),
          fetch("/api/relationships").then(res => { if (!res.ok) throw new Error(`/api/relationships ${res.status}`); return res.json(); }),
        ]);
        setPeople(p);
        setEdges(r);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load data");
      }
    })();
  }, []);

  // ✅ Hooks are always called, regardless of mounted
  const nodes = useMemo(
    () => people.map((p, i) => ({
      id: p.id,
      data: { label: p.fullName || "(no name)" },
      position: { x: (i % 6) * 220, y: Math.floor(i / 6) * 140 },
      style: { borderRadius: 16, padding: 8, background: "white", border: "1px solid #e5e7eb" },
    })),
    [people]
  );

  const rfEdges = useMemo(
    () => edges.map(e => ({ id: e.id, source: e.parentId, target: e.childId })),
    [edges]
  );

  // ✅ Only branch in returned JSX, not before hooks
  return (
    <div className="card h-[80vh] overflow-hidden">
      {err && <div className="p-4 text-red-600">Error loading tree: {err}</div>}
      {!err && !mounted && <div className="p-4">Loading…</div>}
      {!err && mounted && (
        <ReactFlow nodes={nodes} edges={rfEdges} fitView>
          <MiniMap /><Controls /><Background />
        </ReactFlow>
      )}
    </div>
  );
}
