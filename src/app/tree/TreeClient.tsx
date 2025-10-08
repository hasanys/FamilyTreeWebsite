"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import "reactflow/dist/style.css";

// type-only imports for React Flow
import type { Node as RFNode, Edge as RFEdge, NodeTypes } from "reactflow";

const ReactFlow = dynamic(() => import("reactflow").then(m => m.default), { ssr: false });
const Background = dynamic(() => import("reactflow").then(m => m.Background), { ssr: false });
const Controls = dynamic(() => import("reactflow").then(m => m.Controls), { ssr: false });
const MiniMap = dynamic(() => import("reactflow").then(m => m.MiniMap), { ssr: false });

type Person = { id: string; fullName: string; gender?: string | null };
type Edge = { id: string; parentId: string; childId: string };
type Marriage = { id: string; aId: string; bId: string };

// Data carried by our custom node
type PersonNodeData = { id: string; label: string; isFocus: boolean; gender?: string | null };

// Custom node with gender-based styling
function PersonNode({ data }: { data: PersonNodeData }) {
  const genderStyle =
    data.gender === "M"
      ? "border-blue-500 bg-blue-100 hover:bg-blue-200"
      : data.gender === "F"
      ? "border-pink-500 bg-pink-100 hover:bg-pink-200"
      : "border-gray-400 bg-gray-100 hover:bg-gray-200";

  return (
    <Link
      href={`/person/${data.id}`}
      className={`block px-4 py-2 rounded-xl border-2 transition-all hover:shadow-lg min-w-[140px] text-center ${
        data.isFocus
          ? "bg-amber-200 border-amber-600 font-bold ring-4 ring-amber-300 shadow-xl"
          : `${genderStyle}`
      }`}
    >
      <div className="text-sm font-medium leading-tight">{data.label}</div>
    </Link>
  );
}

const nodeTypes: NodeTypes = { person: PersonNode };

export default function Tree() {
  const searchParams = useSearchParams();
  const focusId = searchParams?.get("focus");

  const [mounted, setMounted] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [p, r, m] = await Promise.all([
          fetch("/api/people").then(res => {
            if (!res.ok) throw new Error(`/api/people ${res.status}`);
            return res.json();
          }),
          fetch("/api/relationships").then(res => {
            if (!res.ok) throw new Error(`/api/relationships ${res.status}`);
            return res.json();
          }),
          fetch("/api/marriages")
            .then(res => {
              if (!res.ok) return []; // marriages endpoint might not exist yet
              return res.json();
            })
            .catch(() => []),
        ]);
        setPeople(p);
        setEdges(r);
        setMarriages(m);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load data");
      }
    })();
  }, []);

  const { nodes, rfEdges }: {
    nodes: RFNode<PersonNodeData>[];
    rfEdges: RFEdge[];
  } = useMemo(() => {
    if (people.length === 0) return { nodes: [] as RFNode<PersonNodeData>[], rfEdges: [] as RFEdge[] };

    // Build adjacency maps
    const childrenMap = new Map<string, string[]>();
    const parentsMap = new Map<string, string[]>();

    edges.forEach(e => {
      if (!childrenMap.has(e.parentId)) childrenMap.set(e.parentId, []);
      childrenMap.get(e.parentId)!.push(e.childId);

      if (!parentsMap.has(e.childId)) parentsMap.set(e.childId, []);
      parentsMap.get(e.childId)!.push(e.parentId);
    });

    // Find roots (ancestors with no parents)
    const roots = people.filter(p => !parentsMap.has(p.id));

    // If focusing on someone, start from them and expand both ways
    let startNodes: Person[] = [];
    if (focusId) {
      const focusPerson = people.find(p => p.id === focusId);
      if (focusPerson) {
        startNodes = [focusPerson];
      }
    }

    // Otherwise start from roots, or first person if no clear root
    if (startNodes.length === 0) {
      startNodes = roots.length > 0 ? roots.slice(0, 10) : [people[0]];
    }

    // BFS to assign generations
    const levels = new Map<string, number>();
    const visited = new Set<string>();
    const queue: Array<{ id: string; level: number }> = startNodes.map(n => ({ id: n.id, level: 0 }));

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      levels.set(id, level);

      // Add parents (up = negative)
      const parents = parentsMap.get(id) || [];
      parents.forEach(pId => {
        if (!visited.has(pId)) queue.push({ id: pId, level: level - 1 });
      });

      // Add children (down = positive)
      const children = childrenMap.get(id) || [];
      children.forEach(cId => {
        if (!visited.has(cId)) queue.push({ id: cId, level: level + 1 });
      });
    }

    // Group by generation
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, id) => {
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(id);
    });

    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

    // Create nodes with positioning
    const nodes: RFNode<PersonNodeData>[] = [];
    const xSpacing = 200;
    const ySpacing = 140;

    sortedLevels.forEach((level, levelIndex) => {
      const ids = levelGroups.get(level)!;
      const levelWidth = ids.length * xSpacing;

      ids.forEach((id, idx) => {
        const person = people.find(p => p.id === id);
        if (!person) return;

        nodes.push({
          id,
          type: "person",
          data: {
            id,
            label: person.fullName || "(unnamed)",
            isFocus: id === focusId,
            gender: person.gender,
          },
          position: {
            x: idx * xSpacing - levelWidth / 2 + xSpacing / 2,
            y: levelIndex * ySpacing,
          },
        });
      });
    });

    // Parent-child edges
    const parentChildEdges: RFEdge[] = edges
      .filter(e => visited.has(e.parentId) && visited.has(e.childId))
      .map(e => ({
        id: e.id,
        source: e.parentId,
        target: e.childId,
        style: { stroke: "#475569", strokeWidth: 2.5 },
        type: "smoothstep",
        animated: false,
      }));

    // Marriage edges
    const marriageEdges: RFEdge[] = marriages
      .filter(m => visited.has(m.aId) && visited.has(m.bId))
      .map(m => ({
        id: `marriage-${m.id}`,
        source: m.aId,
        target: m.bId,
        style: { stroke: "#ec4899", strokeWidth: 2, strokeDasharray: "5,5" },
        type: "straight",
        animated: false,
      }));

    const rfEdges = [...parentChildEdges, ...marriageEdges];

    return { nodes, rfEdges };
  }, [people, edges, marriages, focusId]);

  const focusPerson = focusId ? people.find(p => p.id === focusId) : null;
  const stats = {
    total: nodes.length,
    generations: new Set(nodes.map(n => n.position.y)).size,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {focusPerson ? (
          <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex-1">
            <div>
              <div className="text-sm text-amber-700">Focused on</div>
              <div className="font-semibold text-lg">{focusPerson.fullName}</div>
            </div>
            <Link href="/tree" className="ml-auto text-sm text-amber-700 hover:underline whitespace-nowrap">
              View all →
            </Link>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-1">
            <div className="text-sm text-blue-700">
              Showing {stats.total} people across {stats.generations} generations
            </div>
          </div>
        )}
      </div>

      <div className="card h-[calc(100vh-200px)] overflow-hidden">
        {err && <div className="p-4 text-red-600">Error: {err}</div>}
        {!err && !mounted && <div className="p-4">Loading tree...</div>}
        {!err && mounted && nodes.length > 0 && (
          <ReactFlow
            nodes={nodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          >
            <MiniMap
              nodeColor={(node: RFNode<PersonNodeData>) => {
                if (node.data.isFocus) return "#fbbf24";
                if (node.data.gender === "M") return "#3b82f6";
                if (node.data.gender === "F") return "#ec4899";
                return "#9ca3af";
              }}
            />
            <Controls />
            <Background gap={16} size={1} color="#e5e7eb" />
          </ReactFlow>
        )}
        {!err && mounted && nodes.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <div className="text-lg mb-2">Loading Tree...</div>
          </div>
        )}
      </div>

      <div className="flex gap-6 text-xs text-gray-600 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border-2 border-blue-500 bg-blue-100"></div>
          <span>Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border-2 border-pink-500 bg-pink-100"></div>
          <span>Female</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border-2 border-amber-600 bg-amber-200"></div>
          <span>Focused person</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-700"></div>
          <span>Parent-child</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5 bg-pink-500"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, #ec4899 0, #ec4899 5px, transparent 5px, transparent 10px)" }}
          ></div>
          <span>Marriage</span>
        </div>
      </div>
    </div>
  );
}