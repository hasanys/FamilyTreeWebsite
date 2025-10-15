"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export default function PasswordModal({
  open,
  onSuccess,
}: {
  open: boolean;
  onSuccess: () => void;
}) {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setErr(null);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwd) return;

    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) throw new Error(await res.text());
      // persist client-side as well (used by the UI gate)
      localStorage.setItem("ft_auth", "1");
      onSuccess();
    } catch (e: any) {
      setErr(e?.message ?? "Invalid password");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="auth-modal-root fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      {/* Modal */}
      <form
        onSubmit={submit}
        className="relative z-[101] w-[90%] max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
      >
        <div className="mb-3 text-lg font-semibold">Enter password to view content</div>
        <input
          type="password"
          className={clsx(
            "w-full rounded-lg border px-3 py-2 outline-none",
            "border-gray-300 focus:border-gray-400"
          )}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
