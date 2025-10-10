"use client";

const inflight = new Map<string, Promise<any>>();
const done = new Map<string, any>();

export async function getJSON(endpoint: string, timeoutMs = 30000) {
  if (done.has(endpoint)) return done.get(endpoint);
  if (inflight.has(endpoint)) return inflight.get(endpoint)!;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const p = fetch(endpoint, { signal: controller.signal, cache: "no-store" })
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((json) => {
      done.set(endpoint, json);
      inflight.delete(endpoint);
      return json;
    })
    .catch((e) => {
      inflight.delete(endpoint);
      throw e;
    })
    .finally(() => clearTimeout(t));

  inflight.set(endpoint, p);
  return p;
}
