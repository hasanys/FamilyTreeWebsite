// src/lib/json.ts
import { NextResponse } from "next/server";

/** Deep-convert all BigInt values to strings so JSON.stringify won't throw. */
export function sanitizeBigInts<T>(val: T): T {
  if (typeof val === "bigint") return (val.toString() as unknown) as T;
  if (Array.isArray(val)) return (val.map(sanitizeBigInts) as unknown) as T;
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      out[k] = sanitizeBigInts(v as unknown);
    }
    return (out as unknown) as T;
  }
  return val;
}

/** Exactly like NextResponse.json, but BigInt-safe. */
export function jsonResponse(data: unknown, init?: ResponseInit) {
  const body = JSON.stringify(sanitizeBigInts(data));
  return new NextResponse(body, {
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    status: init?.status,
    statusText: init?.statusText,
  });
}

/** Standard error shape, also BigInt-safe. */
export function jsonError(message: string, status = 500) {
  return jsonResponse({ error: message }, { status });
}
