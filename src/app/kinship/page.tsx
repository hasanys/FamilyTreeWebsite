// src/app/kinship/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { computeKinship } from "@/lib/kinship";
import Link from "next/link";

function fullName(g?: string | null, f?: string | null) {
  return [g ?? "", f ?? ""].join(" ").trim() || "(Unknown)";
}

async function searchPeople(q: string) {
  if (!q) return [];
  // keep lean; single query per search box
  return prisma.person.findMany({
    where: {
      OR: [
        { givenName: { contains: q, mode: "insensitive" } },
        { familyName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 10,
    select: { id: true, recNo: true, givenName: true, familyName: true },
  });
}

export default async function KinshipPage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string; q?: string; q2?: string };
}) {
  const a = searchParams.a ?? "";
  const b = searchParams.b ?? "";
  const q = searchParams.q ?? "";
  const q2 = searchParams.q2 ?? "";

  // Run searches sequentially to avoid exceeding pool size
  const optsA = await searchPeople(q);
  const optsB = await searchPeople(q2);

  // Call computeKinship directly (no extra HTTP roundtrip / extra pool checkout)
  const result =
    a && b ? await computeKinship(prisma, a, b).catch((e) => ({ error: String(e) })) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="font-serif text-3xl">Relationship Finder</h1>
      <p className="text-sm text-gray-600">
        Enter two IDs or search by name, then submit to see how they’re related.
      </p>

      <form className="rounded-2xl border bg-white/70 p-5 shadow-sm space-y-4" method="get">
        {/* Search helpers */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Search A</label>
            <input className="w-full border rounded px-3 py-2" name="q" defaultValue={q} placeholder="e.g. Ali" />
            {optsA.length > 0 && (
              <ul className="mt-2 text-sm">
                {optsA.map((p) => (
                  <li key={p.id}>
                    <button className="text-blue-700 hover:underline" name="a" value={p.id} formAction="/kinship">
                      {fullName(p.givenName, p.familyName)}{" "}
                      <span className="text-gray-500">({p.recNo ?? "?"})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Search B</label>
            <input className="w-full border rounded px-3 py-2" name="q2" defaultValue={q2} placeholder="e.g. Sara" />
            {optsB.length > 0 && (
              <ul className="mt-2 text-sm">
                {optsB.map((p) => (
                  <li key={p.id}>
                    <button className="text-blue-700 hover:underline" name="b" value={p.id} formAction="/kinship">
                      {fullName(p.givenName, p.familyName)}{" "}
                      <span className="text-gray-500">({p.recNo ?? "?"})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Raw ID inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Person A ID</label>
            <input className="w-full border rounded px-3 py-2" name="a" defaultValue={a} placeholder="UUID" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Person B ID</label>
            <input className="w-full border rounded px-3 py-2" name="b" defaultValue={b} placeholder="UUID" />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn" type="submit">Compute</button>
          {a && <Link className="btn-secondary" href={`/person/${a}`}>Open A</Link>}
          {b && <Link className="btn-secondary" href={`/person/${b}`}>Open B</Link>}
        </div>
      </form>

      {result && !("error" in result) && (
        <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-2">Result</h2>
          <div className="text-xl font-semibold">{result.relation}</div>
          {result.details?.lcaId && (
            <div className="mt-2 text-sm text-gray-700">
              LCA:{" "}
              <Link className="text-blue-700 hover:underline" href={`/person/${result.details.lcaId}`}>
                {result.details.lcaId}
              </Link>
              <br />
              Generations: A↑{result.details.upFromA} &nbsp; B↑{result.details.upFromB}
            </div>
          )}
          {result.details?.pathNote && (
            <div className="mt-2 text-sm text-gray-500">{result.details.pathNote}</div>
          )}
        </section>
      )}

      {result && "error" in result && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {result.error}
        </div>
      )}
    </main>
  );
}
