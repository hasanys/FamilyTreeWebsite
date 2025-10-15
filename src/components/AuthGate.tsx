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

  // Compute initial lock state on mount
  useEffect(() => {
    if (isHome) {
      setLocked(false);
      return;
    }
    const lsOk = typeof window !== "undefined" && localStorage.getItem("ft_auth") === "1";
    // Cookie check (non-HttpOnly) is optional—localStorage drives the UI
    const ckOk = typeof document !== "undefined" && document.cookie.includes("ft_auth=1");
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
    <PasswordModal
      open={locked}
      onSuccess={() => {
        setLocked(false);
      }}
    />
  );
}
