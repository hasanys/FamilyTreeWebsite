"use client";

import Link from "next/link";
import React from "react";
import clsx from "clsx";

type Person = { id: string; fullName: string; gender?: string | null };
type ChildBucket = {
  person: Person;
  grandchildren: Person[];
};
type SpouseBucket = {
  spouse: Person | null;
  children: ChildBucket[];
};

type Data = {
  focus: Person;
  parents: (Person | null)[];
  grandparents: Array<{ parent: Person | null; parents: (Person | null)[] }>;
  /** All spouses of the focus person (includes spouses without shared children) */
  spouses?: Person[];
  /** Buckets used to group children by (known) spouse */
  spouseBuckets: SpouseBucket[];
  nav: { up: { id: string; name: string } | null; down: { id: string; name: string } | null };
};

/* Helpers */
function splitParents(parents: (Person | null)[]) {
  let father: Person | null = null;
  let mother: Person | null = null;
  for (const p of parents) {
    if (!p) continue;
    const g = (p.gender ?? "").toLowerCase();
    if (!father && g.startsWith("m")) father = p;
    else if (!mother && g.startsWith("f")) mother = p;
  }
  if (!father) father = parents[0] ?? null;
  if (!mother) mother = parents[1] ?? null;
  return { father, mother };
}

function uniq<T extends { id?: string | number | null }>(xs: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of xs) {
    const raw = x?.id;
    if (raw === undefined || raw === null) {
      out.push(x);
      continue;
    }
    const k = String(raw);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

/* Pill component */
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
  p,
  id,
  parentIds,
  register,
  tone = "slate",
  size = "md",
  isFocus = false,
}: {
  p: Person | null;
  id: string;
  parentIds?: string[];
  register: (id: string, el: HTMLDivElement | null) => void;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  /** visual emphasis for the "You" pill */
  isFocus?: boolean;
}) {
  const sizeCls =
    size === "sm"
      ? "px-3 py-1.5 text-[13px]"
      : size === "lg"
      ? "px-4 py-2.5 text-[15px]"
      : "px-4 py-2 text-[14px]";

  return (
    <div
      ref={(el) => register(id, el)}
      data-id={id}
      data-parent-ids={(parentIds ?? []).join(",")}
      className={clsx(
        "relative inline-flex items-center rounded-2xl border bg-white text-gray-900 shadow-sm",
        "border-gray-200 hover:shadow-md transition-shadow",
        sizeCls,
        isFocus && "font-semibold border-2 border-amber-400 ring-2 ring-amber-300 shadow-md"
      )}
      title={p?.fullName ?? ""}
    >
      <span
        className={clsx(
          "absolute -left-1 top-1.5 bottom-1.5 rounded-full",
          isFocus ? "w-4" : "w-1.5",
          "bg-gradient-to-b",
          toneAccent[tone]
        )}
      />
      {p ? (
        <Link href={`/tree?id=${p.id}`} className="no-underline text-inherit">
          {p.fullName}
        </Link>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  );
}

/* Row wrapper */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-x-4 py-8">
      <div className="justify-self-start text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </div>
     <div className="flex flex-wrap items-start justify-center gap-6 translate-x-[-40px]">{children}</div>
    </div>
  );
}

/* Main component */
export default function TreeBoxes({ data }: { data: Data }) {
  const { focus, parents, grandparents, spouseBuckets, spouses: apiSpouses = [], nav } = data;
  const { father, mother } = splitParents(parents);

  const [PGF, PGM] = grandparents.find((g) => g.parent?.id === father?.id)?.parents ?? [null, null];
  const [MGF, MGM] = grandparents.find((g) => g.parent?.id === mother?.id)?.parents ?? [null, null];

  // Show all spouses returned by the API (includes spouses without shared children).
  // Fallback to spouseBuckets for backward compatibility.
  const spouses = uniq(
    (apiSpouses?.length
      ? apiSpouses
      : spouseBuckets.map((b) => b.spouse).filter((s): s is Person => !!s)) as Person[]
  );

  const nodesRef = React.useRef(new Map<string, HTMLDivElement>());
  const [lines, setLines] = React.useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);

  const register = (key: string, el: HTMLDivElement | null) => {
    const m = nodesRef.current;
    if (el) m.set(key, el);
    else m.delete(key);
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
      const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

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

          segs.push({ x1: c.cx, y1: yChildTop, x2: c.cx, y2: midY });
          segs.push({
            x1: Math.min(c.cx, p.cx),
            y1: midY,
            x2: Math.max(c.cx, p.cx),
            y2: midY,
          });
          segs.push({ x1: p.cx, y1: midY, x2: p.cx, y2: yParentBottom });
        }
      });

      setLines(segs);
    };

    const recompute = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(computeLines);
    };

    recompute();

    const ro = new ResizeObserver(recompute);
    const container = document.getElementById("tree-canvas-tw");
    if (container) ro.observe(container);

    window.addEventListener("resize", recompute);

    const mo = new MutationObserver(recompute);
    if (container) mo.observe(container, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [data]);

  const idFor = (p: Person | null, fallback: string) => p?.id ?? fallback;

  return (
    <div className="grid gap-10">

      <div id="tree-canvas-tw" className="relative">
        <svg className="pointer-events-none absolute inset-0 -z-10" width="100%" height="100%">
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className="stroke-slate-300"
              strokeWidth="2"
            />
          ))}
        </svg>

        {[PGF, PGM, MGF, MGM].some(Boolean) && (
          <Row label="Grandparents">
            {PGF && (
              <Pill
                p={PGF}
                id={idFor(PGF, "pgf")}
                parentIds={[idFor(father, "father")]}
                register={register}
                tone="blue"
              />
            )}
            {PGM && (
              <Pill
                p={PGM}
                id={idFor(PGM, "pgm")}
                parentIds={[idFor(father, "father")]}
                register={register}
                tone="blue"
              />
            )}
            {MGF && (
              <Pill
                p={MGF}
                id={idFor(MGF, "mgf")}
                parentIds={[idFor(mother, "mother")]}
                register={register}
                tone="pink"
              />
            )}
            {MGM && (
              <Pill
                p={MGM}
                id={idFor(MGM, "mgm")}
                parentIds={[idFor(mother, "mother")]}
                register={register}
                tone="pink"
              />
            )}
          </Row>
        )}

        {[father, mother].some(Boolean) && (
          <Row label="Parents">
            {father && (
              <Pill
                p={father}
                id={idFor(father, "father")}
                parentIds={[idFor(focus, "focus")]}
                register={register}
                tone="blue"
              />
            )}
            {mother && (
              <Pill
                p={mother}
                id={idFor(mother, "mother")}
                parentIds={[idFor(focus, "focus")]}
                register={register}
                tone="pink"
              />
            )}
          </Row>
        )}

        <Row label="You + Spouses">
          <Pill
            p={focus}
            id={idFor(focus, "focus")}
            register={register}
            tone="amber"
            size="lg"
            isFocus
          />
          {spouses.map((s) => (
            <Pill key={s.id} p={s} id={s.id} register={register} tone="violet" />
          ))}
        </Row>

        <Row label="Children">
          {spouseBuckets.map((bucket, idx) => {
            const spouse = bucket.spouse;
            const parentIds = spouse ? [idFor(focus, "focus"), spouse.id] : [idFor(focus, "focus")];

            return (
              <div
                key={spouse?.id ?? `unknown-${idx}`}
                className="flex min-w-[220px] flex-col items-center gap-3"
              >
                {spouse ? (
                  <div className="text-[12px] font-medium text-gray-500">With {spouse.fullName}</div>
                ) : (
                  <div className="text-[12px] font-medium text-gray-400">Spouse unknown</div>
                )}

                <div className="flex flex-wrap items-start justify-center gap-4">
                  {bucket.children.length ? (
                    bucket.children.map((ch) => (
                      <div
                        key={ch.person.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3"
                      >
                        <div className="mb-2 flex justify-center">
                          <Pill
                            p={ch.person}
                            id={ch.person.id}
                            parentIds={parentIds}
                            register={register}
                            tone="green"
                          />
                        </div>
                        <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Children of {ch.person.fullName}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {ch.grandchildren.length ? (
                            ch.grandchildren.map((g) => (
                              <Pill
                                key={g.id}
                                p={g}
                                id={g.id}
                                parentIds={[ch.person.id]}
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
    </div>
  );
}
