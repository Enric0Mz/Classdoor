"use client";

import { useState } from "react";

const LABELS = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

export default function StarPicker({ value, onChange, size = "lg" }) {
  const [hovered, setHovered] = useState(0);
  const displayed = hovered || value;

  const starSizeClass = size === "sm" ? "h-6 w-6" : "h-9 w-9";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const filled = starValue <= displayed;
          return (
            <button
              key={starValue}
              type="button"
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(starValue)}
              className="cursor-pointer p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <svg
                className={`${starSizeClass} transition-colors ${filled ? "text-yellow-400" : "text-gray-200"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      <span
        className={`text-sm font-medium ${displayed ? "text-indigo-600" : "text-gray-300"}`}
      >
        {LABELS[displayed] || "Selecione uma nota"}
      </span>
    </div>
  );
}
