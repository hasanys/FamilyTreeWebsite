"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HeaderNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC or when clicking outside
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const links = [
    { href: "/search", label: "Search Person" },
    { href: "/explore", label: "Explore" },
    { href: "/kinship", label: "Relations" },
    { href: "/tree", label: "Browse Tree" },
    { href: "/contact", label: "Contact" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <div className="ml-auto flex items-center">
      {/* Desktop links */}
      <div className="hidden md:flex gap-5">
        {links.map((l) => (
          <Link key={l.href} className="navlink" href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center rounded-lg border px-2.5 py-2 text-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          {open ? (
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        ref={panelRef}
        className={`md:hidden fixed inset-x-0 top-[56px] z-40 border-b bg-[var(--bg)]/95 backdrop-blur transition-transform ${
          open ? "translate-y-0" : "-translate-y-[120%]"
        }`}
      >
        <nav className="mx-auto max-w-6xl px-4 py-3 grid gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm hover:bg-white/60 border"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
