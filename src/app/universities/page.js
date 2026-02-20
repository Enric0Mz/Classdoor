"use client";

import { useState, useEffect, useMemo } from "react";
import UniversityCard from "@/components/UniversityCard";

const STATE_FILTERS = ["Todos", "SP", "RJ", "MG", "RS", "PR", "SC", "DF"];
const TYPE_FILTERS = [
  { label: "Todas", value: null },
  { label: "Pública", value: "PUBLIC" },
  { label: "Privada", value: "PRIVATE" },
];
const HERO_CHIPS = ["Em alta", "Top rated", "Públicas", "Privadas", "Destaque"];

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeState, setActiveState] = useState("Todos");
  const [activeType, setActiveType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const res = await fetch("/api/v1/universities");
        if (!res.ok) throw new Error("Falha ao carregar universidades");
        const data = await res.json();
        setUniversities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUniversities();
  }, []);

  const filtered = useMemo(() => {
    let result = universities;

    if (activeState !== "Todos") {
      result = result.filter((u) =>
        u.location.toUpperCase().includes(activeState.toUpperCase())
      );
    }

    if (activeType) {
      result = result.filter((u) => u.type === activeType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
      );
    }

    if (sortByRating) {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return result;
  }, [universities, activeState, activeType, searchQuery, sortByRating]);

  const avgRating = useMemo(() => {
    const rated = universities.filter((u) => u.rating != null);
    if (rated.length === 0) return 0;
    return (rated.reduce((sum, u) => sum + u.rating, 0) / rated.length).toFixed(1);
  }, [universities]);

  // --- Hero Section ---
  const heroSection = (
    <section className="hero-gradient px-6 pb-10 pt-12 text-center">
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          +{universities.length > 0 ? universities.length : "500"} universidades avaliadas
        </span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Encontre a uni{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            perfeita pra você
          </span>
        </h1>

        <p className="mt-3 text-base text-muted-foreground">
          Avaliações reais de quem tá lá dentro. Sem filtro, sem marketing. Só a real.
        </p>

        {/* Search bar */}
        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-white p-2 shadow-sm">
          <svg className="ml-2 h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Busca por universidade, cidade ou curso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Buscar
          </button>
        </div>

        {/* Hero chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {HERO_CHIPS.map((chip) => (
            <span
              key={chip}
              className="cursor-pointer rounded-full border border-border bg-white px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );

  const hasActiveFilters = activeState !== "Todos" || activeType !== null;

  // --- Stats bar ---
  const statsBar = (
    <div className="border-b border-border px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            {loading ? "..." : filtered.length} universidades
          </span>
          {!loading && avgRating > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Nota média: {avgRating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                : "border-border text-muted-foreground hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[0.6rem] font-bold text-white">
                {(activeState !== "Todos" ? 1 : 0) + (activeType !== null ? 1 : 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setSortByRating((prev) => !prev)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              sortByRating
                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                : "border-border text-muted-foreground hover:border-yellow-200 hover:text-yellow-600"
            }`}
          >
            Melhor avaliadas
            <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // --- Filter row ---
  const filterRow = (
    <div className="border-b border-border px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6">
        {/* Estado filter */}
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="text-sm font-medium text-foreground">Estado</span>
          <div className="flex flex-wrap gap-1.5">
            {STATE_FILTERS.map((state) => (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  activeState === state
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo filter */}
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <span className="text-sm font-medium text-foreground">Tipo</span>
          <div className="flex gap-1.5">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t.label}
                onClick={() => setActiveType(t.value)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  activeType === t.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- Loading skeleton ---
  if (loading) {
    return (
      <main>
        {heroSection}
        {statsBar}
        {showFilters && filterRow}
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-border bg-card">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                  <div className="mb-3 h-4 w-1/3 rounded bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-md bg-muted" />
                    <div className="h-6 w-20 rounded-md bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <main>
        {heroSection}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --- Main content ---
  return (
    <main>
      {heroSection}
      {statsBar}
      {filterRow}

      <div className="mx-auto max-w-6xl px-6 py-8">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Nenhuma universidade encontrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
