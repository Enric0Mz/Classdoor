"use client";

const DIFFICULTY_LABELS = ["Fácil", "Tranquilo", "Médio", "Difícil", "Puxado"];

export default function DifficultyPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {DIFFICULTY_LABELS.map((label, i) => {
        const level = i + 1;
        const isSelected = value === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex-1 cursor-pointer rounded-xl py-2 text-xs font-medium transition-all ${
              isSelected
                ? "brand-gradient text-white shadow-sm"
                : "border border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            {level}
            <span className="mt-0.5 block text-[0.65rem] font-normal opacity-80">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
