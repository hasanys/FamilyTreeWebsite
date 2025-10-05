"use client";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

type Person = { id: string; fullName: string };
type Edge = { id: string; parentId: string; childId: string };

export default function Tree() {
  const [people, setPeople] = useState<Person[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([
          fetch("/api/people").then(res => { if (!res.ok) throw new Error(`/api/people ${res.status}`); return res.json(); }),
          fetch("/api/relationships").then(res => { if (!res.ok) throw new Error(`/api/relationships ${res.status}`); return res.json(); }),
        ]);
        setPeople(p); setEdges(r);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load data");
      }
    })();
  }, []);

  if (err) return <div className="card p-4">Error loading tree: {err}</div>;

  const nodes = useMemo(() =>
    people.map((p, i) => ({
      id: p.id,
      data: { label: p.fullName || "(no name)" },
      position: { x: (i % 6) * 220, y: Math.floor(i / 6) * 140 },
      style: { borderRadius: 16, padding: 8, background: "white", border: "1px solid #e5e7eb" },
    })), [people]);

  const rfEdges = useMemo(
    () => edges.map(e => ({ id: e.id, source: e.parentId, target: e.childId })),
    [edges]
  );

  return (
    <div className="card h-[80vh] overflow-hidden">
      <ReactFlow nodes={nodes} edges={rfEdges} fitView>
        <MiniMap /><Controls /><Background />
      </ReactFlow>
    </div>
  );
}
