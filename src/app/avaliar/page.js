"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Search, ChevronDown, ArrowLeft } from "lucide-react";

// ─── Interactive star picker ──────────────────────────────────────────────────

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const displayed = hovered || value;

  const LABELS = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

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
                className={`h-9 w-9 transition-colors ${filled ? "text-yellow-400" : "text-gray-200"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      <span className={`text-sm font-medium ${displayed ? "text-indigo-600" : "text-gray-300"}`}>
        {LABELS[displayed] || "Selecione uma nota"}
      </span>
    </div>
  );
}

// ─── Difficulty picker ────────────────────────────────────────────────────────

const DIFFICULTY_LABELS = ["Fácil", "Tranquilo", "Médio", "Difícil", "Puxado"];

function DifficultyPicker({ value, onChange }) {
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
            <span className="mt-0.5 block text-[0.65rem] font-normal opacity-80">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── University selector ──────────────────────────────────────────────────────

function UniversitySelector({ value, onChange, universities }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = universities.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = universities.find((u) => u.id === value);

  function select(university) {
    onChange(university.id);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors hover:border-indigo-300 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        {selected ? (
          <span className="font-medium text-gray-800">{selected.name}</span>
        ) : (
          <span className="text-gray-400">Selecione uma universidade...</span>
        )}
        <ChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar universidade..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">Nenhuma universidade encontrada.</li>
            ) : (
              filtered.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => select(u)}
                    className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-700 ${
                      u.id === value ? "bg-indigo-50 font-semibold text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    <span className="block font-medium">{u.name}</span>
                    <span className="text-xs text-gray-400">{u.location}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AvaliarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUniversityId = searchParams.get("universityId");

  const [universities, setUniversities] = useState([]);
  const [universityId, setUniversityId] = useState(preselectedUniversityId || "");
  const [rating, setRating] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Auth guard
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.replace("/register");
      return;
    }
    setToken(storedToken);
  }, [router]);

  // Fetch university list for selector
  useEffect(() => {
    async function fetchUniversities() {
      try {
        const res = await fetch("/api/v1/universities");
        if (res.ok) {
          const data = await res.json();
          setUniversities(data.data ?? []);
        }
      } catch {
        // non-blocking — university list is a convenience
      }
    }
    fetchUniversities();
  }, []);

  function validate() {
    if (!universityId) return "Selecione uma universidade.";
    if (!rating) return "Escolha uma nota de 1 a 5.";
    if (!difficultyLevel) return "Escolha o nível de dificuldade.";
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const prosText = pros.trim();
      const consText = cons.trim();
      const comment = (prosText || consText)
        ? JSON.stringify({ pros: prosText, cons: consText })
        : undefined;

      const response = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ universityId, rating, difficultyLevel, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Erro ao enviar avaliação.");
      }

      router.push(`/universities/${universityId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) return null;

  return (
    <main className="hero-gradient min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              classdoor
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gray-900">
            Avaliar universidade
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sua avaliação ajuda outros estudantes a escolherem melhor
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 1 0 2 0V9a1 1 0 1 0-2 0v4zm1-7.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">

            {/* University */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Universidade
              </label>
              <UniversitySelector
                value={universityId}
                onChange={setUniversityId}
                universities={universities}
              />
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-gray-700">
                Nota geral
              </label>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 py-5">
                <StarPicker value={rating} onChange={setRating} />
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Nível de dificuldade
                </label>
                <span className="text-xs text-gray-400">1 = mais fácil, 5 = mais difícil</span>
              </div>
              <DifficultyPicker value={difficultyLevel} onChange={setDifficultyLevel} />
            </div>

            {/* Comment — Prós & Contras */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Comentário{" "}
                <span className="font-normal text-gray-400">(opcional)</span>
              </label>

              {/* Prós */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span>✅</span>
                  <span className="text-sm font-semibold text-green-700">Prós</span>
                  <span className="ml-auto text-xs text-gray-400">{pros.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={pros}
                  onChange={(e) => setPros(e.target.value)}
                  placeholder="Pontos positivos: infraestrutura, professores, oportunidades..."
                  className="w-full resize-none rounded-xl border border-green-200 bg-green-50/50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-green-300 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Contras */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span className="text-sm font-semibold text-amber-700">Contras</span>
                  <span className="ml-auto text-xs text-gray-400">{cons.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={cons}
                  onChange={(e) => setCons(e.target.value)}
                  placeholder="Pontos negativos: burocracia, infraestrutura, dificuldades..."
                  className="w-full resize-none rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="brand-gradient flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>🎓 Publicar avaliação</>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link
            href="/universities"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600"
          >
            <ArrowLeft size={14} />
            Voltar para universidades
          </Link>
        </div>

      </div>
    </main>
  );
}
