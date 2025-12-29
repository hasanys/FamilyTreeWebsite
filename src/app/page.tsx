// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-16">
      {/* HERO */}
      <section className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif text-5xl md:text-7xl leading-tight tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome to our Family Tree
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"></div>
          </div>
          
          <p className="text-gray-700 text-xl leading-relaxed">
            A living record of our family, past and present. Names, relationships, and memories preserved for future generations.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <IconSearch />
              Search Family
            </Link>
            <Link 
              href="/tree" 
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium shadow hover:shadow-lg transition-all hover:scale-105"
            >
              <IconTree />
              Browse Tree
            </Link>
          </div>

          <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
            Browse freely and explore the family history. If you notice any errors or have information to add, please reach out via the Contact page.
          </p>
        </div>

        {/* Right: Visual */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-blue-900/10 z-10" />
            <div
              className="h-full w-full bg-cover bg-center transform hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop')",
              }}
            />
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-blue-50 p-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 italic">
              Quiet fragments—photos, dates, and names—come together to tell a larger story.
            </p>
          </div>
        </div>
      </section>

      {/* NAME FORMAT DISCLAIMER */}
      <section>
        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 p-6 shadow-md">
          <div className="flex gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Important Note on Names</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Names in this database are listed by first and last name only. For simplification of data storage, 
                salutations, titles, and honorifics may be omitted. This is not meant as disrespect to any of our 
                elders, but simply as a practical approach to database management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PURPOSE & CONTRIBUTE */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              ★
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Purpose</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Families forget fast. Paper fades. Stories get told fewer times each year. This archive keeps names, 
              relationships, and moments in one place so history doesn't get lost. It gives our ancestors visibility 
              and keeps their branches connected to ours.
            </p>
            <p>
              Many of our records live in old <em className="text-amber-700 font-medium">shajrah</em> ledgers or 
              scattered notes. We're converting those into a searchable, accurate database—cleanly modeled, versioned, 
              and easy to explore. Over time, we'll enrich the tree with dates, places, and photos so every person 
              has context, not just a line on a page.
            </p>
            <p>
              This is a long-term effort: careful imports, respectful corrections, and clear sourcing. If you notice 
              an error or can fill a gap, please contribute.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Tag variant="amber">Preservation</Tag>
            <Tag variant="blue">Accuracy</Tag>
            <Tag variant="green">Respect</Tag>
            <Tag variant="purple">Shared History</Tag>
          </div>
        </div>

        {/* Data Accuracy & Contribute */}
        <div className="rounded-3xl bg-gradient-to-br from-white to-blue-50 border border-blue-200 p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-md">
              ℹ️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data & Contributions</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-blue-900">Accuracy Disclaimer:</strong> The data on this website is maintained 
                by individual(s) in the family in their free time and is accurate to the best of their knowledge. 
                However, there may still be mistakes or errors. If you notice any inaccuracies, please accept our 
                apologies and reach out to suggest corrections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How You Can Help</h3>
              <ul className="space-y-2.5 text-gray-700 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Share names, dates, places, or relationships we're missing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Upload old photos with rough dates if you have them</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Flag duplicates or conflicts so we can reconcile them</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Add references—ledger scans, family notes, or public records</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Report any errors or inaccuracies you find</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full justify-center"
              >
                Contact Us to Contribute
              </Link>
            </div>

            <p className="text-xs text-gray-600 bg-white/80 rounded-lg p-3 border border-gray-200">
              <strong>Privacy note:</strong> We review all submissions before publishing to protect privacy and 
              maintain lineage accuracy.
            </p>
          </div>
        </div>
      </section>
      
      {/* QUICK LINKS */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore the Archive</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            title="Search Person"
            desc="Find someone by name and jump to parents, spouses, and children."
            href="/search"
            icon={<IconSearch />}
            color="from-blue-500 to-blue-600"
          />
          <Card
            title="Browse Tree"
            desc="Pan and zoom the whole tree, or focus on a single branch."
            href="/tree"
            icon={<IconTree />}
            color="from-green-500 to-green-600"
          />
          <Card
            title="Explore Data"
            desc="See highlights: most common names, timelines, and statistics."
            href="/explore"
            icon={<IconCompass />}
            color="from-purple-500 to-purple-600"
          />
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-200 p-8 shadow-xl text-center">
        <p className="text-lg text-gray-800 leading-relaxed max-w-3xl mx-auto">
          This archive improves a little whenever someone adds a fact, a date, or a photo. 
          <strong className="block mt-2 text-amber-900">
            Thanks for helping keep our history alive. 🌳
          </strong>
        </p>
      </section>
    </main>
  );
}

/* ---------- Components ---------- */

function Card({
  title,
  desc,
  href,
  icon,
  color,
}: {
  title: string;
  desc: string;
  href: string;
  icon?: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-3xl bg-white border-2 border-gray-200 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="relative space-y-4">
        <div className={`inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
        </div>

        <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 group-hover:gap-3 transition-all">
          Explore <span className="text-lg">→</span>
        </span>
      </div>
    </Link>
  );
}

function Tag({ children, variant }: { children: React.ReactNode; variant: 'amber' | 'blue' | 'green' | 'purple' }) {
  const colors = {
    amber: 'bg-amber-100 border-amber-300 text-amber-800',
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
    green: 'bg-green-100 border-green-300 text-green-800',
    purple: 'bg-purple-100 border-purple-300 text-purple-800',
  };
  
  return (
    <span className={`inline-block rounded-full border-2 px-4 py-1.5 text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

/* Inline icons */
function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  );
}

function IconTree() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 3v6M12 21v-6M12 9h6M12 15H6M6 9h4M14 15h4" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}