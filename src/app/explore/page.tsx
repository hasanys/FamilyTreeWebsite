// src/app/explore/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

// helpers
function fullName(g?: string | null, f?: string | null) {
  return [g ?? "", f ?? ""].join(" ").trim() || "(Unknown)";
}
const fmt = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");
const num = (n: number | undefined | null) =>
  typeof n === "number" ? n.toLocaleString() : "—";

export default async function ExplorePage() {
  // ---------- BASIC COUNTS ----------
  const [
    totalPeople,
    aliveCount,
    withDob,
    withDod,
    totalMarriages,
    oldest,
    newest,
  ] = await Promise.all([
    prisma.person.count(),
    prisma.person.count({ where: { alive: true } }),
    prisma.person.count({ where: { NOT: { dob: null } } }),
    prisma.person.count({ where: { NOT: { dod: null } } }),
    prisma.marriage.count(),
    prisma.person.findFirst({
      where: { dob: { not: null } },
      orderBy: { dob: "asc" },
      select: { id: true, givenName: true, familyName: true, dob: true },
    }),
    prisma.person.findFirst({
      where: { dob: { not: null } },
      orderBy: { dob: "desc" },
      select: { id: true, givenName: true, familyName: true, dob: true },
    }),
  ]);

  // ---------- AGGREGATES / GROUPINGS ----------
  const [
    birthsPerDecade,
    deathsPerDecade,
    topSurnames,
    topParentsGrouped,
    rootsLeaves,
    parentCoverage,
    lifespanRows,
    oldestLiving,
    mostMarriedRows,
    ageAtFirstMarriageRows,
    largestSibships,
    topCountries,
    anomalies,
    hijriCoverage,
  ] = await Promise.all([
    prisma.$queryRaw<Array<{ decade: number; count: number }>>`
      SELECT (EXTRACT(YEAR FROM "dob")::int / 10) * 10 AS decade,
             COUNT(*)::int AS count
      FROM "Person"
      WHERE "dob" IS NOT NULL
      GROUP BY decade
      ORDER BY decade ASC
    `,
    prisma.$queryRaw<Array<{ decade: number; count: number }>>`
      SELECT (EXTRACT(YEAR FROM "dod")::int / 10) * 10 AS decade,
             COUNT(*)::int AS count
      FROM "Person"
      WHERE "dod" IS NOT NULL
      GROUP BY decade
      ORDER BY decade ASC
    `,
    // surnames
    prisma.person.groupBy({
      by: ["familyName"],
      where: { familyName: { not: null } },
      _count: { familyName: true },
      orderBy: { _count: { familyName: "desc" } },
      take: 10,
    }),
    // parents with most children
    prisma.parentChild.groupBy({
      by: ["parentId"],
      _count: { parentId: true },
      orderBy: { _count: { parentId: "desc" } },
      take: 10,
    }),
    // roots & leaves
    prisma.$queryRaw<Array<{ kind: "roots" | "leaves"; c: number }>>`
      SELECT 'roots'::text AS kind, COUNT(*)::int AS c
      FROM "Person" p
      WHERE NOT EXISTS (SELECT 1 FROM "ParentChild" pc WHERE pc."childId" = p.id)
      UNION ALL
      SELECT 'leaves'::text AS kind, COUNT(*)::int AS c
      FROM "Person" p
      WHERE NOT EXISTS (SELECT 1 FROM "ParentChild" pc WHERE pc."parentId" = p.id)
    `,
    // parent coverage per child: both / one / none
    prisma.$queryRaw<Array<{ bucket: "both" | "one" | "none"; c: number }>>`
      WITH pc AS (
        SELECT "childId", COUNT(*) AS n
        FROM "ParentChild" GROUP BY "childId"
      )
      SELECT CASE n
               WHEN 2 THEN 'both'
               WHEN 1 THEN 'one'
               ELSE 'none'
             END::text AS bucket,
             COUNT(*)::int AS c
      FROM (
        SELECT p.id, COALESCE(pc.n, 0) AS n
        FROM "Person" p
        LEFT JOIN pc ON pc."childId" = p.id
      ) t
      GROUP BY bucket
    `,
    // lifespan (years) for deceased
    prisma.$queryRaw<Array<{ years: number }>>`
      SELECT EXTRACT(EPOCH FROM (dod - dob))/31557600.0 AS years
      FROM "Person"
      WHERE dob IS NOT NULL AND dod IS NOT NULL AND dod > dob
    `,
    // oldest living (by dob asc)
    prisma.person.findMany({
      where: { alive: true, dob: { not: null } },
      orderBy: { dob: "asc" },
      take: 10,
      select: { id: true, givenName: true, familyName: true, dob: true },
    }),
    // most marriages per person (join to names in SQL)
    prisma.$queryRaw<
      Array<{ id: number; givenName: string | null; familyName: string | null; cnt: number }>
    >`
      WITH mm AS (
        SELECT id,
               ((SELECT COUNT(*) FROM "Marriage" m WHERE m."aId" = p.id) +
                (SELECT COUNT(*) FROM "Marriage" m WHERE m."bId" = p.id))::int AS cnt
        FROM "Person" p
      )
      SELECT p.id, p."givenName", p."familyName", mm.cnt
      FROM mm
      JOIN "Person" p ON p.id = mm.id
      WHERE mm.cnt > 0
      ORDER BY mm.cnt DESC, p.id ASC
      LIMIT 10
    `,
    // age at first marriage (years, per person)
    prisma.$queryRaw<Array<{ age: number }>>`
      WITH ends AS (
        SELECT p.id, p.dob, MIN(m.start) AS first_start
        FROM "Person" p
        JOIN "Marriage" m ON m."aId"=p.id OR m."bId"=p.id
        WHERE p.dob IS NOT NULL AND m.start IS NOT NULL
        GROUP BY p.id, p.dob
      )
      SELECT EXTRACT(EPOCH FROM (first_start - dob))/31557600.0 AS age
      FROM ends WHERE first_start > dob
    `,
    // largest sibling groups by (Father,Mother) pair
    prisma.$queryRaw<
      Array<{
        fatherId: number;
        motherId: number;
        kids: number;
        fGiven: string | null;
        fFamily: string | null;
        mGiven: string | null;
        mFamily: string | null;
      }>
    >`
      WITH pairs AS (
        SELECT f."parentId" AS father_id, m."parentId" AS mother_id, f."childId"
        FROM "ParentChild" f
        JOIN "ParentChild" m ON m."childId" = f."childId"
        WHERE f."relationType"='Father' AND m."relationType"='Mother'
      )
      SELECT father_id AS "fatherId",
             mother_id AS "motherId",
             COUNT(*)::int AS kids,
             pf."givenName" AS "fGiven", pf."familyName" AS "fFamily",
             pm."givenName" AS "mGiven", pm."familyName" AS "mFamily"
      FROM pairs
      JOIN "Person" pf ON pf.id = father_id
      JOIN "Person" pm ON pm.id = mother_id
      GROUP BY father_id, mother_id, pf."givenName", pf."familyName", pm."givenName", pm."familyName"
      ORDER BY kids DESC
      LIMIT 10
    `,
    // top countries (if you have country)
    prisma.$queryRaw<Array<{ country: string; count: number }>>`
      SELECT country, COUNT(*)::int AS count
      FROM "Person"
      WHERE country IS NOT NULL AND length(country)>0
      GROUP BY country
      ORDER BY count DESC, country ASC
      LIMIT 15
    `,
    // anomalies
    prisma.$queryRaw<Array<{ kind: string; c: number }>>`
      SELECT 'dod_before_dob' AS kind, COUNT(*)::int AS c
      FROM "Person" WHERE dob IS NOT NULL AND dod IS NOT NULL AND dod < dob
      UNION ALL
      SELECT 'dob_in_future', COUNT(*)::int FROM "Person" WHERE dob > NOW()
      UNION ALL
      SELECT 'missing_name', COUNT(*)::int FROM "Person" WHERE (COALESCE("givenName",'')='' AND COALESCE("familyName",'')='')
    `,
    // hijri coverage
    prisma.$queryRaw<Array<{ kind: string; c: number }>>`
      SELECT 'dob_hijri' AS kind, COUNT(*)::int FROM "Person" WHERE "dobHijri" IS NOT NULL
      UNION ALL
      SELECT 'dod_hijri', COUNT(*)::int FROM "Person" WHERE "dodHijri" IS NOT NULL
    `,
  ]);

  // map/format derived data
  const topSurnamesRows = topSurnames.map((r) => ({
    familyName: r.familyName as string,
    count: r._count.familyName,
  }));

  const topParents = await Promise.all(
    topParentsGrouped.map(async (row) => {
      const person = await prisma.person.findUnique({
        where: { id: row.parentId },
        select: { id: true, givenName: true, familyName: true, gender: true },
      });
      return { parentId: row.parentId, count: row._count.parentId, person };
    })
  );

  const rootsCount = rootsLeaves.find((x) => x.kind === "roots")?.c ?? 0;
  const leavesCount = rootsLeaves.find((x) => x.kind === "leaves")?.c ?? 0;

  const bothParents = parentCoverage.find((x) => x.bucket === "both")?.c ?? 0;
  const oneParent = parentCoverage.find((x) => x.bucket === "one")?.c ?? 0;
  const noParents = parentCoverage.find((x) => x.bucket === "none")?.c ?? 0;

  const lifeVals = lifespanRows
    .map((r) => Number(r.years))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 130) // defensive bounds

  lifeVals.sort((a, b) => a - b);

  const avgLifeNum = lifeVals.length
    ? lifeVals.reduce((a, b) => a + b, 0) / lifeVals.length
    : null;
  const medLifeNum = lifeVals.length
    ? (lifeVals.length % 2
        ? lifeVals[(lifeVals.length - 1) / 2]
        : (lifeVals[lifeVals.length / 2 - 1] + lifeVals[lifeVals.length / 2]) / 2)
    : null;
  const maxLifeNum = lifeVals.length ? lifeVals[lifeVals.length - 1] : null;

  const lifeFmt = (n: number | null) => (n == null ? "—" : Math.round(n));

  const mostMarried = mostMarriedRows.map((r) => ({
    id: r.id,
    name: fullName(r.givenName, r.familyName),
    count: r.cnt,
  }));

  // Age at first marriage buckets (5-year bins)
  const ages = ageAtFirstMarriageRows.map((r) => Math.floor(r.age));
  const bucketMap = new Map<number, number>();
  for (const a of ages) {
    if (!isFinite(a) || a < 0 || a > 120) continue;
    const b = Math.floor(a / 5) * 5;
    bucketMap.set(b, (bucketMap.get(b) || 0) + 1);
  }
  const firstMarriageBuckets = Array.from(bucketMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, count]) => ({ label: `${bucket}-${bucket + 4}`, count }));

  const anomalyMap = Object.fromEntries(anomalies.map((a) => [a.kind, a.c]));
  const hijriMap = Object.fromEntries(hijriCoverage.map((h) => [h.kind, h.c]));

  // Random person link
  const randomPerson = await (async () => {
    if (totalPeople === 0) return null;
    const skip = Math.floor(Math.random() * totalPeople);
    const rows = await prisma.person.findMany({
      take: 1,
      skip,
      select: { id: true, givenName: true, familyName: true },
    });
    return rows[0] ?? null;
  })();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-3xl">Explore</h1>
        {randomPerson && (
          <Link href={`/person/${randomPerson.id}`} className="btn">
            Random: {fullName(randomPerson.givenName, randomPerson.familyName)}
          </Link>
        )}
      </header>

      {/* Overview cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total People" value={totalPeople} />
        <StatCard label="Alive (marked)" value={aliveCount} />
        <StatCard label="With DOB" value={withDob} />
        <StatCard label="With DOD" value={withDod} />
        <StatCard label="Marriages" value={totalMarriages} />
        <StatCard
          label="Oldest DOB"
          value={
            oldest ? (
              <Link className="text-blue-700 hover:underline" href={`/person/${oldest.id}`}>
                {fmt(oldest.dob)} — {fullName(oldest.givenName, oldest.familyName)}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <StatCard
          label="Newest DOB"
          value={
            newest ? (
              <Link className="text-blue-700 hover:underline" href={`/person/${newest.id}`}>
                {fmt(newest.dob)} — {fullName(newest.givenName, newest.familyName)}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <StatCard label="Roots (no parents)" value={rootsCount} />
        <StatCard label="Leaves (no children)" value={leavesCount} />
      </section>

      {/* People shape / Parent coverage */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Parent coverage</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <MiniStat label="Both parents" value={bothParents} />
          <MiniStat label="One parent" value={oneParent} />
          <MiniStat label="No parents" value={noParents} />
        </div>
      </section>

      {/* Lifespan */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Lifespan</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <MiniStat label="Average (yrs)" value={lifeFmt(avgLifeNum)} />
          <MiniStat label="Median (yrs)" value={lifeFmt(medLifeNum)} />
          <MiniStat label="Max (yrs)" value={lifeFmt(maxLifeNum)} />
        </div>
      </section>

      {/* Oldest living */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Oldest living (top 10)</h2>
        {oldestLiving.length === 0 ? (
          <div className="text-gray-500 text-sm">No living DOB data.</div>
        ) : (
          <ol className="space-y-1 list-decimal ml-5">
            {oldestLiving.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <Link className="text-blue-700 hover:underline truncate" href={`/person/${p.id}`}>
                  {fullName(p.givenName, p.familyName)}
                </Link>
                <span className="tabular-nums text-gray-600">{fmt(p.dob)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Timeline */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Births per decade</h2>
          <Bars
            rows={birthsPerDecade.map((b) => ({
              label: `${b.decade}s`,
              count: b.count,
            }))}
          />
        </div>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Deaths per decade</h2>
          <Bars
            rows={deathsPerDecade.map((b) => ({
              label: `${b.decade}s`,
              count: b.count,
            }))}
          />
        </div>
      </section>

      {/* Names & Countries */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Most common family names</h2>
          <ol className="space-y-1 list-decimal ml-5">
            {topSurnamesRows.map((s) => (
              <li key={s.familyName} className="flex items-center justify-between">
                <span className="truncate">{s.familyName}</span>
                <span className="tabular-nums text-gray-600">{s.count}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Top birth countries</h2>
          {topCountries.length === 0 ? (
            <div className="text-gray-500 text-sm">No country data.</div>
          ) : (
            <ol className="space-y-1 list-decimal ml-5">
              {topCountries.map((c) => (
                <li key={c.country} className="flex items-center justify-between">
                  <span className="truncate">{c.country}</span>
                  <span className="tabular-nums text-gray-600">{c.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Parents with most children */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Parents with the most children</h2>
        <ol className="space-y-1 list-decimal ml-5">
          {topParents.map((row) => (
            <li key={row.parentId} className="flex items-center justify-between">
              {row.person ? (
                <Link className="text-blue-700 hover:underline truncate" href={`/person/${row.person.id}`}>
                  {fullName(row.person.givenName, row.person.familyName)}
                </Link>
              ) : (
                <span className="truncate">(Unknown)</span>
              )}
              <span className="tabular-nums text-gray-600">{row.count}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Marriages & Family */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Most marriages (top 10)</h2>
          {mostMarried.length === 0 ? (
            <div className="text-gray-500 text-sm">No marriage data.</div>
          ) : (
            <ol className="space-y-1 list-decimal ml-5">
              {mostMarried.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <Link className="text-blue-700 hover:underline truncate" href={`/person/${m.id}`}>
                    {m.name}
                  </Link>
                  <span className="tabular-nums text-gray-600">{m.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Age at first marriage (5-yr bins)</h2>
          {firstMarriageBuckets.length === 0 ? (
            <div className="text-gray-500 text-sm">No DOB/start data.</div>
          ) : (
            <Bars rows={firstMarriageBuckets} />
          )}
        </div>
      </section>

      {/* Largest sibling groups */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Largest sibling groups (by parents)</h2>
        {largestSibships.length === 0 ? (
          <div className="text-gray-500 text-sm">No paired Father/Mother data.</div>
        ) : (
          <ol className="space-y-1 list-decimal ml-5">
            {largestSibships.map((r, i) => (
              <li key={`${r.fatherId}-${r.motherId}-${i}`} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  <Link className="text-blue-700 hover:underline" href={`/person/${r.fatherId}`}>
                    {fullName(r.fGiven, r.fFamily)}
                  </Link>
                  {" "}&{" "}
                  <Link className="text-blue-700 hover:underline" href={`/person/${r.motherId}`}>
                    {fullName(r.mGiven, r.mFamily)}
                  </Link>
                </span>
                <span className="tabular-nums text-gray-600">{r.kids}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Data quality */}
      <section className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Data quality</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <MiniStat label="DoD before DoB" value={anomalyMap["dod_before_dob"] ?? 0} />
          <MiniStat label="DOB in future" value={anomalyMap["dob_in_future"] ?? 0} />
          <MiniStat label="Missing name" value={anomalyMap["missing_name"] ?? 0} />
          <MiniStat label="DOB (Hijri) present" value={hijriMap["dob_hijri"] ?? 0} />
          <MiniStat label="DOD (Hijri) present" value={hijriMap["dod_hijri"] ?? 0} />
        </div>
      </section>
    </main>
  );
}

// ---------- UI bits ----------
function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white/60 p-4">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; count: number }[] }) {
  if (rows.length === 0) return <div className="text-gray-500 text-sm">No data.</div>;
  const max = Math.max(...rows.map((x) => x.count), 1);
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <BarRow key={r.label} label={r.label} count={r.count} max={max} />
      ))}
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = Math.max(2, Math.round((count / Math.max(1, max)) * 100));
  return (
    <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm">
      <div className="text-gray-600">{label}</div>
      <div className="h-3 rounded bg-gray-100">
        <div className="h-3 rounded bg-gray-400/60" style={{ width: `${pct}%` }} />
      </div>
      <div className="tabular-nums text-gray-700">{count}</div>
    </div>
  );
}
