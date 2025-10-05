"use client";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

type Person = { id: string; fullName: string };
type Edge = { id: string; parentId: string; childId: string };

export default function Tree() {
  const [people, setPeople] = useState<Person[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/people"), fetch("/api/relationships")])
      .then(async ([p, r]) => [await p.json(), await r.json()])
      .then(([p, r]) => { setPeople(p); setEdges(r); });
  }, []);

  const nodes = useMemo(() =>
    people.map((p,i)=>({
      id: p.id, data:{label:p.fullName},
      position:{ x:(i%6)*220, y: Math.floor(i/6)*140 },
      style:{ borderRadius:16, padding:8, background:"white", border:"1px solid #e5e7eb" }
    })), [people]);

  const rfEdges = useMemo(() => edges.map(e => ({ id:e.id, source:e.parentId, target:e.childId })), [edges]);

  return (
    <div className="h-[80vh] rounded-2xl border bg-white/70">
      <ReactFlow nodes={nodes} edges={rfEdges} fitView>
        <MiniMap /><Controls /><Background />
      </ReactFlow>
    </div>
  );
}
