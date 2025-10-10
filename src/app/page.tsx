// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 space-y-12">
      {/* HERO */}
      <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-center">
        <div className="space-y-6">
          <h1 className="font-serif text-4xl md:text-6xl leading-tight tracking-tight">
            Welcome to our Family Tree
          </h1>
          <p className="text-gray-800/90 text-lg">
            A living record of our family, past and present. Names, occupations, and children, preserved for the next generations.
          </p>

          <p className="text-sm text-gray-600">
            Read-only for guests. Editors sign in on the Admin page to suggest fixes and add details.
          </p>
        </div>

        {/* Right: calm archival visual */}
        <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-50/40 via-transparent to-transparent" />
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop')",
              }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Quiet fragments—photos, dates, and names—come together to tell a larger story.
          </p>
        </div>
      </section>


      {/* PURPOSE (folded from the standalone page) */}
      <section id="purpose" className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Purpose</h2>
          <p className="mt-3 text-sm text-gray-800">
            Families forget fast. Paper fades. Stories get told fewer times each year. This archive keeps names,
            relationships, and moments in one place so history doesn’t get lost. It gives our ancestors visibility and
            keeps their branches connected to ours.
          </p>
          <p className="mt-3 text-sm text-gray-800">
            Many of our records live in old <em>shajrah</em> ledgers or scattered notes. We’re converting those into a
            searchable, accurate database—cleanly modeled, versioned, and easy to explore. Over time, we’ll enrich the
            tree with dates, places, and photos so every person has context, not just a line on a page.
          </p>
          <p className="mt-3 text-sm text-gray-800">
            This is a long-term effort: careful imports, respectful corrections, and clear sourcing. If you notice an
            error or can fill a gap, please contribute.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Tag>Preservation</Tag>
            <Tag>Accuracy</Tag>
            <Tag>Respect</Tag>
            <Tag>Shared history</Tag>
          </div>
        </div>

        {/* How to contribute */}
        <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
          <h3 className="text-lg font-semibold">How to contribute</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-800">
            <li>• Share names, dates, places, or relationships we’re missing.</li>
            <li>• Upload old photos (with rough dates if you have them).</li>
            <li>• Flag duplicates or conflicts so we can reconcile them.</li>
            <li>• Add references—ledger scans, family notes, or public records.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-xl border bg-white/70 px-4 py-2 shadow-sm hover:bg-white text-sm">
              Contact
            </Link>
            <Link href="/admin" className="rounded-xl border bg-white/70 px-4 py-2 shadow-sm hover:bg-white text-sm">
              Admin (editors)
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            We review submissions before publishing to protect privacy and maintain lineage accuracy.
          </p>
        </div>
      </section>
      
      {/* QUICK LINKS */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card
          title="Search"
          desc="Find someone by name and jump to parents, spouses, and children."
          href="/search"
          icon={<IconSearch />}
        />
        <Card
          title="Browse Tree"
          desc="Pan and zoom the whole tree, or focus on a single branch."
          href="/tree"
          icon={<IconTree />}
        />
        <Card
          title="Explore"
          desc="See highlights: most common names, timelines, and more."
          href="/explore"
          icon={<IconCompass />}
        />
      </section>

      {/* FOOTER NOTE */}
      <section className="rounded-2xl border bg-gradient-to-r from-white/80 to-amber-50/50 p-6 shadow-sm">
        <p className="text-sm text-gray-700">
          This archive improves a little whenever someone adds a fact, a date, or a photo. Thanks for helping keep our history alive.
        </p>
      </section>
    </main>
  );
}

/* ---------- Presentational bits ---------- */

function Card({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white/70 p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gray-700">{icon}</span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-gray-700">{desc}</p>
          <span className="mt-3 inline-block text-sm text-blue-700 group-hover:underline">
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border bg-white/70 px-3 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

/* Inline icons */
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-80">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconTree() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-80">
      <path d="M12 3v6M12 21v-6M12 9h6M12 15H6M6 9h4M14 15h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function IconCompass() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-80">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
