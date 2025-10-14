// src/lib/hijri.ts
//
// Gregorian → Hijri (Islamic civil) conversion.
// Uses arithmetic/tabular Hijri calendar (not Umm al-Qura).
// Good for on-the-fly display; if you need Saudi/Umm al-Qura, we can swap the kernel later.

/** Parse "YYYY-MM-DD" (lenient to YYYY-M-D). Throws on invalid. */
export function parseISODate(d: string): { y: number; m: number; day: number } {
  const m = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})\s*$/.exec(d);
  if (!m) throw new Error("Invalid date format; expected YYYY-MM-DD");
  const y = +m[1], mo = +m[2], day = +m[3];
  if (mo < 1 || mo > 12) throw new Error("Month out of range");
  if (day < 1 || day > 31) throw new Error("Day out of range");
  return { y, m: mo, day };
}

/** Zero-pad to 2. */
const z2 = (n: number) => (n < 10 ? `0${n}` : String(n));

/** Gregorian date → Julian Day Number (Fliegel–Van Flandern algorithm). */
export function gregorianToJDN(y: number, m: number, d: number): number {
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

/** JDN → Gregorian (not strictly needed here, but handy). */
export function jdnToGregorian(jd: number): { y: number; m: number; d: number } {
  let a = jd + 32044;
  let b = Math.floor((4 * a + 3) / 146097);
  let c = a - Math.floor((146097 * b) / 4);
  let d2 = Math.floor((4 * c + 3) / 1461);
  let e = c - Math.floor((1461 * d2) / 4);
  let m2 = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m2 + 2) / 5) + 1;
  const month = m2 + 3 - 12 * Math.floor(m2 / 12);
  const year = 100 * b + d2 - 4800 + Math.floor(m2 / 12);
  return { y: year, m: month, d: day };
}

/**
 * JDN → Islamic (Hijri civil) date.
 * Based on arithmetic calendar formulas (Epoch = 1948439.5).
 * Returns year/month/day (1-based).
 */
export function jdnToHijriCivil(jd: number): { hy: number; hm: number; hd: number } {
  const islamicEpoch = 1948439.5;
  const days = Math.floor(jd) - Math.floor(islamicEpoch) + 1;

  const hYear = Math.floor((30 * days + 10646) / 10631);
  const firstDayOfYear = hijriCivilToJDN(hYear, 1, 1);
  const dayOfYear = jd - firstDayOfYear + 1;

  const hMonth = Math.min(
    12,
    Math.ceil(dayOfYear / 29.5) // average month length
  );

  const firstDayOfMonth = hijriCivilToJDN(hYear, hMonth, 1);
  const hDay = jd - firstDayOfMonth + 1;

  return { hy: hYear, hm: hMonth, hd: Math.floor(hDay) };
}

/** Islamic (Hijri civil) → JDN. */
export function hijriCivilToJDN(hy: number, hm: number, hd: number): number {
  // Arithmetic/civil: 354-day year, leap in 11 of every 30 years.
  return (
    hd +
    Math.ceil(29.5 * (hm - 1)) +
    (hy - 1) * 354 +
    Math.floor((3 + 11 * hy) / 30) +
    1948440 - 1
  );
}

/** Gregorian ISO ("YYYY-MM-DD") → Hijri (civil) object + iso string. */
export function gregorianISOToHijri(iso: string) {
  const { y, m, day } = parseISODate(iso);
  const jd = gregorianToJDN(y, m, day);
  const { hy, hm, hd } = jdnToHijriCivil(jd);
  return {
    year: hy,
    month: hm,
    day: hd,
    iso: `${hy}-${z2(hm)}-${z2(hd)}`
  };
}
