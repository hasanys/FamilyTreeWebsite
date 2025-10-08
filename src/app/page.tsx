import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-10 md:grid-cols-2 items-center">
      <div className="space-y-6">
        <h1 className="font-serif text-4xl md:text-5xl leading-tight">
          Welcome to the <span className="underline decoration-amber-800/40">Family Archive</span>
        </h1>
        <p className="text-gray-800/90">
          A living record of our people—names, stories, and branches—preserved for the next generations.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/search" className="rounded-xl border px-4 py-2">Search a person</Link>
          <Link href="/tree" className="rounded-xl border px-4 py-2">Browse full tree</Link>
          <Link href="/explore" className="rounded-xl border px-4 py-2">Explore</Link>
        </div>
      </div>

      <div className="rounded-2xl border p-6 bg-white/70 shadow-sm">
        <div className="aspect-[4/3] w-full rounded-xl border bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
        <p className="mt-3 text-sm text-gray-600">
          An old photograph reminds us: every branch began with a story.
        </p>
      </div>

      <div className="md:col-span-2 mt-6 grid gap-4 md:grid-cols-3 text-sm">
        <div className="rounded-xl border p-4 bg-white/70">
          <h3 className="font-semibold mb-1">Search</h3>
          <p>Find someone by name and jump to their close relatives.</p>
        </div>
        <div className="rounded-xl border p-4 bg-white/70">
          <h3 className="font-semibold mb-1">Explore</h3>
          <p>Interesting facts and highlights (coming soon).</p>
        </div>
        <div className="rounded-xl border p-4 bg-white/70">
          <h3 className="font-semibold mb-1">Purpose</h3>
          <p>Why we built this and how to contribute.</p>
        </div>
      </div>
    </section>
  );
}
