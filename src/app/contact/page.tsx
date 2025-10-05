"use client";
import { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState<"idle"|"sent"|"error">("idle");
  async function submit(form: FormData) {
    const res = await fetch("/api/contact", { method: "POST", body: form });
    setStatus(res.ok ? "sent" : "error");
  }
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-serif text-3xl">Contact</h1>
      <p className="text-sm text-gray-700">Email: <a className="underline" href="mailto:family@example.com">family@example.com</a></p>
      <form action={submit} className="space-y-3 rounded-xl border bg-white/70 p-4">
        <input name="name" placeholder="Your name" className="w-full rounded-xl border px-3 py-2" required />
        <input name="email" placeholder="Your email" className="w-full rounded-xl border px-3 py-2" required />
        <textarea name="message" placeholder="Message" className="w-full rounded-xl border px-3 py-2 h-32" required />
        <button className="rounded-xl border px-4 py-2">Send</button>
        {status==="sent" && <div className="text-green-700 text-sm">Sent. Thank you!</div>}
        {status==="error" && <div className="text-red-700 text-sm">Something went wrong.</div>}
      </form>
    </div>
  );
}
