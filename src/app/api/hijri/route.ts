// src/lib/hijri.ts

/** Parse "YYYY-MM-DD". */
function parseISODate(d: string): { y: number; m: number; day: number } {
  const m = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/.exec(d);
  if (!m) throw new Error("Invalid date format; expected YYYY-MM-DD");
  const y = +m[1], mo = +m[2], day = +m[3];
  return { y, m: mo, day };
}

/** Zero-pad to 2. */
const z2 = (n: number) => (n < 10 ? `0${n}` : String(n));

/** Gregorian → JDN (Fliegel–Van Flandern). */
function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d
    + Math.floor((153 * m2 + 2) / 5)
    + 365 * y2
    + Math.floor(y2 / 4)
    - Math.floor(y2 / 100)
    + Math.floor(y2 / 400)
    - 32045;
}

/** Hijri civil → JDN. */
function hijriCivilToJDN(hy: number, hm: number, hd: number): number {
  return (
    hd +
    Math.ceil(29.5 * (hm - 1)) +
    (hy - 1) * 354 +
    Math.floor((3 + 11 * hy) / 30) +
    1948440 - 1
  );
}

/** JDN → Hijri civil (arithmetical). */
function jdnToHijriCivil(jd: number): { hy: number; hm: number; hd: number } {
  const islamicEpoch = 1948439.5;
  const days = Math.floor(jd) - Math.floor(islamicEpoch) + 1;

  const hYear = Math.floor((30 * days + 10646) / 10631);
  const firstDayOfYear = hijriCivilToJDN(hYear, 1, 1);
  const dayOfYear = jd - firstDayOfYear + 1;

  const hMonth = Math.min(12, Math.ceil(dayOfYear / 29.5));
  const firstDayOfMonth = hijriCivilToJDN(hYear, hMonth, 1);
  const hDay = jd - firstDayOfMonth + 1;

  return { hy: hYear, hm: hMonth, hd: Math.floor(hDay) };
}

/** Gregorian ISO → Hijri civil parts + iso. */
export function gregorianISOToHijri(iso: string) {
  const { y, m, day } = parseISODate(iso);
  const jd = gregorianToJDN(y, m, day);
  const { hy, hm, hd } = jdnToHijriCivil(jd);
  return { year: hy, month: hm, day: hd, iso: `${hy}-${z2(hm)}-${z2(hd)}` };
}

/** Abbrev month names in your style. 1..12 */
const HIJRI_ABBR = [
  "Muh.", "Saf.", "Rab. I", "Rab. II", "Jum. I", "Jum. II",
  "Raj.", "Sha.", "Ram.", "Shaw.", "Dhu Q.", "Dhu H.",
] as const;

/** Format parts → "Mon dd, yyyy AH" */
function formatHijriParts(year: number, month: number, day: number): string {
  const mon = HIJRI_ABBR[(month - 1) as 0|1|2|3|4|5|6|7|8|9|10|11] ?? String(month);
  return `${mon} ${day}, ${year} AH`;
}

/** Prefer Intl Islamic calendar, fallback to arithmetic. Returns formatted or null. */
export function formatHijriFromISO(isoGregorian: string): string | null {
  // 1) Intl
  try {
    const d = new Date(isoGregorian + "T00:00:00Z");
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "UTC",
    }).formatToParts(d);
    const y = Number(parts.find(p => p.type === "year")?.value);
    const m = Number(parts.find(p => p.type === "month")?.value);
    const dd = Number(parts.find(p => p.type === "day")?.value);
    if (y && m && dd) return formatHijriParts(y, m, dd);
  } catch { /* ignore */ }

  // 2) Fallback arithmetic
  try {
    const { year, month, day } = gregorianISOToHijri(isoGregorian);
    return formatHijriParts(year, month, day);
  } catch { /* ignore */ }

  return null;
}

/** From JS Date (Gregorian) → "Mon dd, yyyy AH" or null */
export function formatHijriFromDate(d: Date | null): string | null {
  if (!d) return null;
  const iso = d.toISOString().slice(0, 10);
  return formatHijriFromISO(iso);
}
