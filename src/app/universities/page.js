"use client";

import { useState, useEffect, useMemo } from "react";
import UniversityCard from "@/components/UniversityCard";
import { Search, SlidersHorizontal, MapPin, GraduationCap, TrendingUp, X } from "lucide-react";

const STATE_FILTERS = ["Todos", "SP", "RJ", "MG", "RS", "PR", "SC", "DF", "BA", "PE"];
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
  
  // Filters
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
        setUniversities(data.data ?? []);
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

  const activeFiltersCount = (activeState !== "Todos" ? 1 : 0) + (activeType !== null ? 1 : 0);

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-white pb-12 pt-16 text-center shadow-sm">
        {/* Decorative background elements */}
        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-indigo-50/80 to-transparent opacity-60 blur-3xl" />
        
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition-transform hover:scale-105">
            <TrendingUp size={14} />
            <span>+{universities.length > 0 ? universities.length : "500"} universidades avaliadas</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Encontre a universidade{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              perfeita pra você
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Avaliações reais, transparentes e diretas de alunos e ex-alunos.
            Descubra o que te espera antes da matrícula.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="group relative flex items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100">
              <Search className="mr-3 text-gray-400 group-focus-within:text-indigo-500" size={20} />
              <input
                type="text"
                placeholder="Busque por universidade, cidade ou curso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
              />
              <button className="ml-2 hidden rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 sm:block">
                Buscar
              </button>
            </div>
          </div>

          {/* Quick Chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {HERO_CHIPS.map((chip) => (
              <button
                key={chip}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {loading ? "..." : filtered.length} resultados
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <span className="hidden sm:inline">Ordenado por relevância</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortByRating((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                sortByRating
                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-200"
              }`}
            >
              <span className={sortByRating ? "text-amber-500" : "text-gray-400"}>★</span>
              Melhor avaliadas
            </button>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-200"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[0.65rem] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {(showFilters || activeFiltersCount > 0) && (
          <div className="mb-8 animate-fade-in-down">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
                {/* State Filter */}
                <div className="flex-1">
                  <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <MapPin size={14} />
                    Localização (Estado)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATE_FILTERS.map((state) => (
                      <button
                        key={state}
                        onClick={() => setActiveState(state)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                          activeState === state
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100 sm:h-auto sm:w-px" />

                {/* Type Filter */}
                <div className="flex-1">
                  <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <GraduationCap size={14} />
                    Tipo de Instituição
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => setActiveType(t.value)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                          activeType === t.value
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Clear filters button if needed */}
              {activeFiltersCount > 0 && (
                <div className="mt-5 flex justify-end border-t border-gray-50 pt-4">
                  <button 
                    onClick={() => { setActiveState("Todos"); setActiveType(null); }}
                    className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    <X size={14} />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="h-40 w-full animate-pulse rounded-xl bg-gray-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="mt-auto flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-6 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white px-6 py-2 text-sm font-bold text-red-600 shadow-sm transition-transform hover:scale-105"
            >
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nenhuma universidade encontrada</h3>
            <p className="max-w-xs text-gray-500">
              Tente ajustar seus filtros ou buscar por outro termo.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveState("Todos");
                setActiveType(null);
              }}
              className="mt-6 font-medium text-indigo-600 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
