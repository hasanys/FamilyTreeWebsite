import "./globals.css";
import Link from "next/link";
import { Libre_Baskerville } from "next/font/google";

const headerSerif = Libre_Baskerville({ weight: ["700"], subsets: ["latin"] });

export const metadata = {
  title: "Family Archive",
  description: "Our Family Archive",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-stone-800">
        <header className="sticky top-0 z-10 bg-[var(--bg)]/90 backdrop-blur border-b border-stone-300/60">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4 text-sm">
            <Link href="/" className={`${headerSerif.className} text-2xl tracking-wide`}>
              🕰️ Family Archive
            </Link>
            <div className="ml-auto flex gap-5">
              <Link className="navlink" href="/search">Search Person</Link>
              <Link className="navlink" href="/explore">Explore</Link>
              <Link className="navlink" href="/kinship">Relations</Link>
              <Link className="navlink" href="/tree">Browse Tree</Link>
              <Link className="navlink" href="/purpose">Purpose</Link>
              <Link className="navlink" href="/contact">Contact</Link>
              <Link className="navlink" href="/admin">Admin</Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        <footer className="mt-16 border-t border-stone-300/60 py-6 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} Our Family
        </footer>
      </body>
    </html>
  );
}