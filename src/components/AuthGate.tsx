"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PasswordModal from "./PasswordModal";

/**
 * Shows a password modal on all routes except home (/)
 * and blurs the background while locked.
 */
export default function AuthGate() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute initial lock state on mount / route change
  useEffect(() => {
    if (isHome) {
      setLocked(false);
      return;
    }
    const lsOk =
      typeof window !== "undefined" &&
      localStorage.getItem("ft_auth") === "1";
    // Cookie check (non-HttpOnly) is optional—localStorage drives the UI
    const ckOk =
      typeof document !== "undefined" &&
      document.cookie.includes("ft_auth=1");
    setLocked(!(lsOk || ckOk));
  }, [isHome, pathname]);

  // Add/remove blur class on <html> while locked
  useEffect(() => {
    const root = document.documentElement;
    if (locked) root.classList.add("app-locked");
    else root.classList.remove("app-locked");
    return () => root.classList.remove("app-locked");
  }, [locked]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white px-6 py-4 text-center shadow">
            <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            <p className="text-sm text-gray-700">Unlocking data…</p>
          </div>
        </div>
      )}

      <PasswordModal
        open={locked}
        onSuccess={() => {
          setLocked(false);
          setLoading(true);

          // Force a refresh so server components & APIs rerun with auth
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }}
      />
    </>
  );
}
