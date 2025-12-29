// src/components/Tooltip.tsx
"use client";

import { useState } from "react";

export default function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="ml-1 text-gray-400 hover:text-gray-600 cursor-help"
        aria-label="More information"
      >
        {children}
      </button>
      {show && (
        <div className="absolute z-10 w-64 p-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2">
          {text}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
}