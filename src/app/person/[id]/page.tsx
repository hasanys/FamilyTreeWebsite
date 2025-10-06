import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "nodejs";      // ensure Node runtime
export const revalidate = 0;          // always fresh (or set a small number if you prefer)

function format(val: unknown) {
  if (val === null || val === undefined || val === "") return "—";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

export default async function PersonPage({ params }: { params: { id: string } }) {
  const person = await prisma.person.findUnique({
    where: { id: params.id },
  });

  if (!person) return notFound();

  // Build "Full name" for display
  const fullName = [person.givenName ?? "", person.familyName ?? ""].join(" ").trim() || "(no name)";

  // pull parents & children for quick context (optional; comment out if not needed)
  const parents = await prisma.parentChild.findMany({
    where: { childId: person.id },
    include: { parent: { select: { id: true, givenName: true, familyName: true } } },
  });
  const children = await prisma.parentChild.findMany({
    where: { parentId: person.id },
    include: { child: { select: { id: true, givenName: true, familyName: true } } },
  });
  const spouses = await prisma.marriage.findMany({
    where: { OR: [{ aId: person.id }, { bId: person.id }] },
    include: {
      a: { select: { id: true, givenName: true, familyName: true } },
      b: { select: { id: true, givenName: true, familyName: true } },
    },
  });

  const nice = (g?: string | null, f?: string | null) =>
    [g ?? "", f ?? ""].join(" ").trim() || "(unknown)";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex gap-6 items-start">
        {/* Photo / placeholder */}
        <div className="w-40 h-40 rounded-2xl bg-gray-200 flex items-center justify-center shadow-inner">
          {/* silhouette */}
          <svg viewBox="0 0 24 24" className="w-20 h-20 text-gray-400">
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
          </svg>
        </div>

        <div className="flex-1">
          <h1 className="font-serif text-3xl mb-2">{fullName}</h1>
          <div className="text-sm text-gray-600">ID #{person.recNo ?? person.id}</div>

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <Link href={`/tree?focus=${person.id}`} className="btn">View in Tree</Link>
            <Link href={`/search?q=${encodeURIComponent(fullName)}`} className="btn-secondary">Back to Search</Link>
          </div>
        </div>
      </div>

        {/* Details */}
        <section className="rounded-2xl border bg-white/70 p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Details</h2>

        {/* 2 cols on sm+, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
            <Field label="Given name"     value={person.givenName} />
            <Field label="Family name"    value={person.familyName} />
            <Field label="Gender"         value={person.gender} />
            <Field label="DOB (Gregorian)" value={person.dob ? format(person.dob) : null} />
            <Field label="DOD (Gregorian)" value={person.dod ? format(person.dod) : null} />
            <Field label="DOB (Hijri)"    value={person.dobHijri} />
            <Field label="DOD (Hijri)"    value={person.dodHijri} />
            <Field label="Country"        value={person.country} />
            <Field label="Education"      value={person.education} />
            <Field label="Occupation"     value={person.occupation} />
            <Field label="Buried"         value={person.buried} />
            <Field label="Honour"         value={person.honour} />
            <Field label="Alive"          value={person.alive === null ? null : person.alive ? "Yes" : "No"} />
            <Field label="Notes"          value={person.notes} span />
        </div>
        </section>

        {/* Relations */}
        <section className="rounded-2xl border bg-white/70 p-5 sm:p-6 shadow-sm mt-6">
        <h2 className="text-base font-semibold mb-4">Relations</h2>

        <div className="grid gap-6 sm:grid-cols-2">
            <div>
            <h3 className="mb-2 font-medium">Parents</h3>
            <ul className="ml-4 list-disc space-y-1 marker:text-gray-500">
                {parents.length === 0 && <li className="text-gray-500">Unknown</li>}
                {parents.map((p) => (
                <li key={p.id}>
                    <Link className="text-blue-700 hover:underline" href={`/person/${p.parent.id}`}>
                    {nice(p.parent.givenName, p.parent.familyName)}
                    </Link>
                </li>
                ))}
            </ul>
            </div>

            <div>
            <h3 className="mb-2 font-medium">Children</h3>
            <ul className="ml-4 list-disc space-y-1 marker:text-gray-500">
                {children.length === 0 && <li className="text-gray-500">None recorded</li>}
                {children.map((c) => (
                <li key={c.id}>
                    <Link className="text-blue-700 hover:underline" href={`/person/${c.child.id}`}>
                    {nice(c.child.givenName, c.child.familyName)}
                    </Link>
                </li>
                ))}
            </ul>
            </div>
        </div>

        <div className="mt-6">
            <h3 className="mb-2 font-medium">Spouses</h3>
            <ul className="ml-4 list-disc space-y-1 marker:text-gray-500">
            {spouses.length === 0 && <li className="text-gray-500">None recorded</li>}
            {spouses.map((m) => {
                const other = m.aId === person.id ? m.b : m.a;
                return (
                <li key={m.id}>
                    <Link className="text-blue-700 hover:underline" href={`/person/${other!.id}`}>
                    {nice(other!.givenName, other!.familyName)}
                    </Link>
                </li>
                );
            })}
            </ul>
        </div>
        </section>

        {/* Notes */}
        <section className="rounded-2xl border bg-white/70 p-5 sm:p-6 shadow-sm mt-6">
        <h2 className="text-base font-semibold mb-3">Notes & Highlights</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
            Historical anecdotes, documents, and family contributions can be added here.
        </p>
        </section>

    </main>
  );
}

function Field({ label, value, span = false }: { label: string; value: any; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <div className="grid grid-cols-[9rem_1fr] gap-x-3">
        <div className="text-gray-500">{label}</div>
        <div className="text-gray-900">{format(value)}</div>
      </div>
    </div>
  );
}
