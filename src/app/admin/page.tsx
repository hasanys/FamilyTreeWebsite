"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { setOk(document.cookie.includes("admin=1")); }, []);

  async function login(form: FormData) {
    const r = await fetch("/api/admin-login", { method: "POST", body: form });
    if (r.ok) { setOk(true); setMsg(""); } else { setMsg("Wrong password"); }
  }

  if (!ok) {
    return (
      <div className="max-w-sm space-y-3">
        <h1 className="font-serif text-3xl">Admin</h1>
        <form action={login} className="space-y-3 rounded-xl border bg-white/70 p-4">
          <input type="password" name="password" placeholder="Password" className="w-full rounded-xl border px-3 py-2" />
          <button className="rounded-xl border px-4 py-2">Enter</button>
          {msg && <div className="text-red-700 text-sm">{msg}</div>}
        </form>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Admin Area</h1>
      <p className="text-sm text-gray-700">Stub: add/edit people, imports, etc. goes here.</p>
      <a className="underline" href="/add">Quick add person</a>
    </div>
  );
}
