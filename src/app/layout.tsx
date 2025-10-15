// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { Libre_Baskerville } from "next/font/google";
import HeaderNav from "@/components/HeaderNav";
import AuthGate from "@/components/AuthGate"; // ✅ add this line

const headerSerif = Libre_Baskerville({ weight: ["700"], subsets: ["latin"] });

export const metadata = { title: "Family Tree", description: "Our Family Tree" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-stone-800">
        {/* ✅ Password gate renders a modal over everything when locked */}
        <AuthGate />

        <header className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur border-b border-stone-300/60">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={`${headerSerif.className} text-2xl tracking-wide`}
            >
              Family Tree
            </Link>
            <HeaderNav />
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
