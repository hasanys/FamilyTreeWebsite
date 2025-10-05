"use client";
import { useState } from "react";

export default function Add() {
  const [fullName, setFullName] = useState("");
  async function addPerson() {
    await fetch("/api/people", {
      method: "POST",
      body: JSON.stringify({ fullName }),
      headers: { "Content-Type": "application/json" }
    });
    setFullName("");
    alert("Added");
  }
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Add Person</h1>
      <input
        style={{ border: "1px solid #ccc", padding: 8, borderRadius: 8, marginRight: 8 }}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
      />
      <button style={{ border: "1px solid #ccc", padding: "8px 12px", borderRadius: 8 }} onClick={addPerson}>
        Save
      </button>
    </main>
  );
}
