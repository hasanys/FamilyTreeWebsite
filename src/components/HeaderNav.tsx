"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HeaderNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Disable background scroll while open
  useEffect(() => {
    const root = document.documentElement; // or document.body
    if (open) root.classList.add("overflow-hidden");
    else root.classList.remove("overflow-hidden");
    return () => root.classList.remove("overflow-hidden");
  }, [open]);

  // Close on ESC and when clicking outside
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
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center rounded-lg border px-2.5 py-2 text-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Fullscreen overlay + right drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        {/* Drawer panel */}
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          ref={panelRef}
          className={`absolute right-0 top-0 h-full w-[18rem] max-w-[85vw] bg-[var(--bg)] border-l shadow-xl transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-base font-semibold">Menu</div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="rounded-md border p-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Drawer links */}
          <nav className="px-3 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg border px-3 py-2 text-sm hover:bg-white/60 mb-2"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
