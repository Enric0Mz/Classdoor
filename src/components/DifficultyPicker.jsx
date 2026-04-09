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
            className={`flex-1 cursor-pointer rounded-xl border py-2 text-xs font-bold transition-all ${
              isSelected
                ? "border-secondary bg-secondary-container text-on-secondary-container shadow-sm"
                : "border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface"
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
