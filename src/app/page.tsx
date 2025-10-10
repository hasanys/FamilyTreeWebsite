// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 space-y-12">
      {/* HERO */}
      <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-center">
        <div className="space-y-6">
          <h1 className="font-serif text-4xl md:text-6xl leading-tight tracking-tight">
            Welcome to our Family Tree
          </h1>
          <p className="text-gray-800/90 text-lg">
            A living record of our people—names, stories, and branches—preserved for the next generations.
          </p>

          {/* Small reassurance line */}
          <p className="text-sm text-gray-600">
            Read-only for guests. Editors sign in on the Admin page to suggest fixes and add details.
          </p>
        </div>

        {/* Right side: tasteful visual */}
        <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
            {/* Subtle top gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-50/40 via-transparent to-transparent" />
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  // a calmer archival desk/photo vibe (royalty-free Unsplash)
                  "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop')",
              }}
            />
          </div>
        </div>
      </section>

      {/* QUICK LINKS / FEATURE CARDS */}
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

      {/* HIGHLIGHTS (static teaser to make the page feel fuller) */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">What you can do here</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>• Jump from a person to their close relatives in one click.</li>
            <li>• View marriages and children at a glance on each profile.</li>
            <li>• Explore births by decade and common surnames.</li>
            <li>• Follow branches visually in the interactive tree.</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">How to contribute</h2>
          <p className="mt-3 text-sm text-gray-700">
            Spot an error or have a story to add? Use the <Link href="/contact" className="text-blue-700 underline">contact form</Link> or,
            if you’re an editor, head to <Link href="/admin" className="text-blue-700 underline">Admin</Link> to propose updates. 
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Tag>Names</Tag>
            <Tag>Dates</Tag>
            <Tag>Photos</Tag>
            <Tag>Stories</Tag>
          </div>
        </div>
      </section>

      {/* SUBTLE FOOTER NOTE */}
      <section className="rounded-2xl border bg-gradient-to-r from-white/80 to-amber-50/50 p-6 shadow-sm">
        <p className="text-sm text-gray-700">
          This archive changes as we learn more. Every correction makes the picture clearer—thanks for helping keep our history alive.
        </p>
      </section>
    </main>
  );
}

/* ---------- Small presentational bits (inline, no external deps) ---------- */

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

/* Simple inline icons (keeps it dependency-free) */
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
