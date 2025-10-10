// src/components/Spinner.tsx
"use client";

export default function Spinner({
  size = 16,
  className = "",
  label = "Loading",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const s = `${size}px`;
  return (
    <span role="status" aria-label={label} className={`inline-flex items-center ${className}`}>
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        width={s}
        height={s}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
    </span>
  );
}
