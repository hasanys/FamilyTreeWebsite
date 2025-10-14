"use client";

import Link from "next/link";
import React from "react";
import clsx from "clsx";

type Person = { id: string; fullName: string | null; gender?: string | null };

type Data = {
  focus: Person;
  parents: (Person | null)[];
  grandparents: Array<{ parent: Person | null; parents: (Person | null)[] }>;
  spouseBuckets: Array<{
    spouse: Person | null;
    children: Array<{ person: Person; grandchildren: Person[] }>;
  }>;
  nav: { up: Person | null; down: Person | null };
};

/* ---------- helpers ---------- */
function splitParents(parents: (Person | null)[]) {
  let father: Person | null = null;
  let mother: Person | null = null;
  for (const p of parents) {
    if (!p) continue;
    const g = (p.gender || "").toLowerCase();
    if (!father && g.startsWith("m")) father = p; else if (!mother && g.startsWith("f")) mother = p;
  }
  if (!father) father = parents[0] ?? null;
  if (!mother) mother = parents[1] ?? null;
  return { father, mother };
}
function uniq<T extends { id?: string | number }>(xs: T[]) {
  const seen = new Set<string | number>(), out: T[] = [];
  for (const x of xs) {
    const k = x?.id ?? Symbol();
    if (!seen.has(k as any)) { seen.add(k as any); out.push(x); }
  }
  return out;
}

/* ---------- Pill ---------- */
type Tone = "blue" | "pink" | "amber" | "green" | "slate" | "violet";
const toneAccent: Record<Tone, string> = {
  blue: "from-blue-400 to-blue-600",
  pink: "from-pink-400 to-pink-600",
  amber: "from-amber-400 to-amber-500",
  green: "from-emerald-400 to-emerald-600",
  slate: "from-slate-400 to-slate-500",
  violet: "from-violet-400 to-violet-600",
};

function Pill({
  p, id, parentIds, register, tone = "slate", size = "md",
}: {
  p: Person | null;
  id: string;
  parentIds?: string[];               // ← support multiple parents
  register: (id: string, el: HTMLDivElement | null) => void;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "sm" ? "px-3 py-1.5 text-[13px]" :
    size === "lg" ? "px-4 py-2.5 text-[15px]" :
                    "px-4 py-2 text-[14px]";
  return (
    <div
      ref={(el) => register(id, el)}
      data-id={id}
      data-parent-ids={(parentIds ?? []).join(",")}   // ← comma-separated
      className={clsx(
        "relative inline-flex items-center rounded-2xl border bg-white text-gray-900 shadow-sm",
        "border-gray-200 hover:shadow-md transition-shadow",
        sizeCls
      )}
      title={p?.fullName ?? ""}
    >
      <span className={clsx(
        "absolute -left-1 top-1.5 bottom-1.5 w-1.5 rounded-full",
        "bg-gradient-to-b", toneAccent[tone]
      )}/>
      {p ? (
        <Link href={`/tree?id=${p.id}`} className="no-underline text-inherit">{p.fullName}</Link>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  );
}

/* ---------- Main ---------- */
export default function TreeBoxes({ data }: { data: Data }) {
  const { focus } = data;
  const { father, mother } = splitParents(data.parents ?? []);

  const pat = data.grandparents.find((g) => g.parent?.id === father?.id) ?? { parent: null, parents: [] };
  const mat = data.grandparents.find((g) => g.parent?.id === mother?.id) ?? { parent: null, parents: [] };
  const [PGF, PGM] = [pat.parents?.[0] ?? null, pat.parents?.[1] ?? null];
  const [MGF, MGM] = [mat.parents?.[0] ?? null, mat.parents?.[1] ?? null];

  // spouse list (unique, non-null)
  const spouses = uniq(
    data.spouseBuckets.map((b) => b.spouse).filter((s): s is Person => !!s)
  );

  // ---------------- connectors (parent bottom -> child top; supports multiple parents) ----------------
  const nodesRef = React.useRef(new Map<string, HTMLDivElement>());
  const [lines, setLines] = React.useState<Array<{ x1:number;y1:number;x2:number;y2:number }>>([]);

  const register = (key: string, el: HTMLDivElement | null) => {
    const m = nodesRef.current;
    if (el) m.set(key, el); else m.delete(key);
  };

  React.useEffect(() => {
    let frame: number | null = null;

    const computeLines = () => {
      const m = nodesRef.current;
      const container = document.getElementById("tree-canvas-tw");
      if (!container) return;

      const root = container.getBoundingClientRect();
      const anchors = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return {
          cx: r.left + r.width / 2 - root.left,
          top: r.top - root.top,
          bottom: r.bottom - root.top,
        };
      };

      const PAD = 10;
      const segs: Array<{ x1:number;y1:number;x2:number;y2:number }> = [];

      // For each node, draw to *each* parent in data-parent-ids
      m.forEach((el) => {
        const parentIds = (el.getAttribute("data-parent-ids") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!parentIds.length) return;

        const c = anchors(el);
        for (const pid of parentIds) {
          const parentEl = m.get(pid);
          if (!parentEl) continue;

          const p = anchors(parentEl);
          const yChildTop = c.top - PAD;
          const yParentBottom = p.bottom + PAD;
          const midY = (yChildTop + yParentBottom) / 2;

          segs.push({ x1:c.cx, y1:yChildTop, x2:c.cx, y2:midY });
          segs.push({ x1:Math.min(c.cx,p.cx), y1:midY, x2:Math.max(c.cx,p.cx), y2:midY });
          segs.push({ x1:p.cx, y1:midY, x2:p.cx, y2:yParentBottom });
        }
      });

      setLines(segs);
    };

    const recompute = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(computeLines);
    };

    recompute(); // initial

    const ro = new ResizeObserver(recompute);
    const container = document.getElementById("tree-canvas-tw");
    if (container) ro.observe(container);

    window.addEventListener("resize", recompute);

    // Recompute on DOM changes (children / grandchildren mount)
    const mo = new MutationObserver(recompute);
    if (container) mo.observe(container, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  const id = (p: Person | null, fb: string) => (p?.id ?? fb);

  return (
    <div className="grid gap-10">
      {/* Up button */}
      <div className="flex justify-center">
        <a
          className={clsx(
            "rounded-2xl border border-gray-200 bg-white px-4 py-2 font-semibold shadow-sm",
            !data.nav?.up && "pointer-events-none opacity-40"
          )}
          href={data.nav?.up ? `/tree?id=${data.nav.up.id}` : "#"}
        >
          ↑ Up one generation
        </a>
      </div>

      <div id="tree-canvas-tw" className="relative">
        {/* connectors */}
        <svg className="pointer-events-none absolute inset-0 -z-10" width="100%" height="100%">
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="stroke-slate-300" strokeWidth="2" />
          ))}
        </svg>

        {/* rows */}
        <Row label="Grandparents">
          <Pill p={PGF} id={id(PGF, "pgf")} parentIds={[id(father, "father")]} register={register} tone="blue" />
          <Pill p={PGM} id={id(PGM, "pgm")} parentIds={[id(father, "father")]} register={register} tone="blue" />
          <Pill p={MGF} id={id(MGF, "mgf")} parentIds={[id(mother, "mother")]} register={register} tone="pink" />
          <Pill p={MGM} id={id(MGM, "mgm")} parentIds={[id(mother, "mother")]} register={register} tone="pink" />
        </Row>

        <Row label="Parents">
          <Pill p={father} id={id(father, "father")} parentIds={[id(focus, "focus")]} register={register} tone="blue" />
          <Pill p={mother} id={id(mother, "mother")} parentIds={[id(focus, "focus")]} register={register} tone="pink" />
        </Row>

        {/* You + Spouse(s) */}
        <Row label="You">
          <Pill p={focus} id={id(focus, "focus")} register={register} tone="amber" size="lg" />
          {spouses.map((s) => (
            <Pill key={s.id} p={s} id={s.id} register={register} tone="violet" />
          ))}
        </Row>

 {/* Children (grouped by spouse, and inside each, grouped per child) */}
<Row label="Children">
  {data.spouseBuckets.map((bucket, idx) => {
    const spouse = bucket.spouse ?? null;
    const parentIds = spouse ? [id(focus, "focus"), spouse.id] : [id(focus, "focus")];

    return (
      <div
        key={spouse?.id ?? `unknown-${idx}`}
        className="flex min-w-[220px] flex-col items-center gap-3"
      >
        {spouse ? (
          <div className="text-[12px] font-medium text-gray-500">
            With {spouse.fullName}
          </div>
        ) : (
          <div className="text-[12px] font-medium text-gray-400">Spouse unknown</div>
        )}

        {/* grid of child groups for this spouse */}
        <div className="flex flex-wrap items-start justify-center gap-4">
          {bucket.children.length ? (
            bucket.children.map((ch) => (
              <div
                key={ch.person.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3"
              >
                {/* child pill (connects to BOTH parents) */}
                <div className="flex justify-center mb-2">
                  <Pill
                    p={ch.person}
                    id={ch.person.id}
                    parentIds={parentIds}
                    register={register}
                    tone="green"
                  />
                </div>

                {/* little header so it reads clearly */}
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-center">
                  Children of {ch.person.fullName}
                </div>

                {/* grandchildren of this child */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {ch.grandchildren.length ? (
                    ch.grandchildren.map((g) => (
                      <Pill
                        key={g.id}
                        p={g}
                        id={g.id}
                        parentIds={[ch.person.id]}  // connect to the child
                        register={register}
                        tone="slate"
                        size="sm"
                      />
                    ))
                  ) : (
                    <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-[11px] text-gray-600">
                      No grandchildren
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs text-gray-600">
              No children
            </span>
          )}
        </div>
      </div>
    );
  })}
</Row>

      </div>

      {/* Down button */}
      <div className="flex justify-center">
        <a
          className={clsx(
            "rounded-2xl border border-gray-200 bg-white px-4 py-2 font-semibold shadow-sm",
            !data.nav?.down && "pointer-events-none opacity-40"
          )}
          href={data.nav?.down ? `/tree?id=${data.nav.down.id}` : "#"}
        >
          ↓ Down one generation
        </a>
      </div>
    </div>
  );
}

/* Row */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-x-4 py-8">
      <div className="justify-self-start text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className="flex flex-wrap items-start justify-center gap-6">{children}</div>
    </div>
  );
}
