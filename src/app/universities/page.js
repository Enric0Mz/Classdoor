"use client";

import { useState, useEffect, useMemo } from "react";
import UniversityCard from "@/components/UniversityCard";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  GraduationCap,
  TrendingUp,
  X,
  Zap,
  Lightbulb,
} from "lucide-react";

const UNIVERSITIES_PER_PAGE = 20;

const STATE_FILTERS = [
  "Todos",
  "SP",
  "RJ",
  "MG",
  "RS",
  "PR",
  "SC",
  "DF",
  "BA",
  "PE",
];
const TYPE_FILTERS = [
  { label: "Todas", value: null },
  { label: "Pública", value: "PUBLIC" },
  { label: "Privada", value: "PRIVATE" },
];

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [userRole, setUserRole] = useState(null);

  // Filters
  const [activeState, setActiveState] = useState("Todos");
  const [activeType, setActiveType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortByRating, setSortByRating] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded?.role) setUserRole(decoded.role);
      }
    } catch {
      // ignore invalid token
    }
  }, []);

  const isAdmin = userRole === "ADMIN";

  function handleUniversityDelete(universityId) {
    setUniversities((prev) =>
      prev.filter((university) => university.id !== universityId),
    );
  }

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const res = await fetch(
          `/api/v1/universities?limit=${UNIVERSITIES_PER_PAGE}&page=1`,
        );
        if (!res.ok) throw new Error("Falha ao carregar universidades");
        const data = await res.json();
        setUniversities(data.data ?? []);
        setPagination(data.pagination ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUniversities();
  }, []);

  async function loadMoreUniversities() {
    if (!pagination || isLoadingMore) return;
    const nextPage = pagination.page + 1;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/v1/universities?limit=${UNIVERSITIES_PER_PAGE}&page=${nextPage}`,
      );
      const data = await res.json();
      setUniversities((prev) => [...prev, ...(data.data ?? [])]);
      setPagination(data.pagination ?? null);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const hasMoreUniversities =
    pagination && pagination.page < pagination.totalPages;

  const filtered = useMemo(() => {
    let result = universities;

    if (activeState !== "Todos") {
      result = result.filter((u) =>
        u.location.toUpperCase().includes(activeState.toUpperCase()),
      );
    }

    if (activeType) {
      result = result.filter((u) => u.type === activeType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.location.toLowerCase().includes(query),
      );
    }

    if (sortByRating) {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return result;
  }, [universities, activeState, activeType, searchQuery, sortByRating]);

  const avgRating = useMemo(() => {
    const ratedUniversities = universities.filter((u) => u.rating != null);
    if (ratedUniversities.length === 0) return "—";
    const sum = ratedUniversities.reduce((acc, u) => acc + u.rating, 0);
    return (sum / ratedUniversities.length).toFixed(1);
  }, [universities]);

  const activeFiltersCount =
    (activeState !== "Todos" ? 1 : 0) + (activeType !== null ? 1 : 0);

  function handleChipClick(chip) {
    if (chip === "Em alta" || chip === "Top rated") {
      setSortByRating(true);
    } else if (chip === "Públicas") {
      setActiveType("PUBLIC");
    } else if (chip === "Privadas") {
      setActiveType("PRIVATE");
    }
    // "Destaque" is decorative — no action
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden pb-16 pt-16 text-center"
        style={{ backgroundColor: "#0f0f14" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial purple glow in center */}
        <div className="absolute left-1/2 top-0 -z-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          {/* Badge chip */}
          <div className="stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <TrendingUp size={13} />
            <span>
              +{pagination?.total || universities.length || "500"} universidades
              avaliadas
            </span>
          </div>

          {/* Heading */}
          <h1 className="stagger-2 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Encontre a universidade{" "}
            <span className="brand-gradient-text">perfeita pra você</span>
          </h1>

          <p className="stagger-3 mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Avaliações reais, transparentes e diretas de alunos e ex-alunos.
            Descubra o que te espera antes da matrícula.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-500/60">
              <Search
                className="mr-3 shrink-0 text-gray-500 group-focus-within:text-indigo-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Busque por universidade, cidade ou curso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-gray-500"
              />
              <button className="brand-gradient ml-2 hidden rounded-xl px-6 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 sm:block">
                Buscar
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">
                {loading ? "..." : (pagination?.total ?? universities.length)}
              </span>
              <span className="text-xs text-gray-400">universidades</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">
                {loading ? "..." : avgRating}
              </span>
              <span className="text-xs text-gray-400">nota média</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="flex items-center gap-1 text-xl font-bold text-white">
                <Zap size={16} className="text-indigo-400" />
                100%
              </span>
              <span className="text-xs text-gray-400">
                avaliações verificadas
              </span>
            </div>
          </div>

          {/* Quick Chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Em alta", "Top rated", "Públicas", "Privadas", "Destaque"].map(
              (chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/20 hover:text-indigo-300"
                >
                  {chip}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Bottom gradient fade into light content */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="text-sm font-semibold text-gray-700">
              {loading ? "..." : filtered.length} resultados
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <span className="hidden sm:inline text-gray-400">
              Ordenado por relevância
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortByRating((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                sortByRating
                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-200"
              }`}
            >
              <span
                className={sortByRating ? "text-amber-500" : "text-gray-400"}
              >
                ★
              </span>
              Melhor avaliadas
            </button>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
                {/* State Filter */}
                <div className="flex-1">
                  <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
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
                  <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                    <GraduationCap size={14} />
                    Tipo de Instituição
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((typeFilter) => (
                      <button
                        key={typeFilter.label}
                        onClick={() => setActiveType(typeFilter.value)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                          activeType === typeFilter.value
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {typeFilter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear filters button */}
              {activeFiltersCount > 0 && (
                <div className="mt-5 flex justify-end border-t border-gray-50 pt-4">
                  <button
                    onClick={() => {
                      setActiveState("Todos");
                      setActiveType(null);
                    }}
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
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="skeleton h-40 w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="mt-auto flex gap-2">
                  <div className="skeleton h-6 w-16 rounded" />
                  <div className="skeleton h-6 w-16 rounded" />
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
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Nenhuma universidade encontrada
            </h3>
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
            <Link
              href="/sugerir-universidade"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
            >
              <Lightbulb size={14} />
              Nao encontrou sua universidade? Sugira aqui
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  isAdmin={isAdmin}
                  onDelete={handleUniversityDelete}
                />
              ))}
            </div>

            {hasMoreUniversities && (
              <button
                onClick={loadMoreUniversities}
                disabled={isLoadingMore}
                className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-3.5 text-sm font-medium text-gray-500 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                      />
                    </svg>
                    Carregando...
                  </>
                ) : (
                  <>
                    Carregar mais universidades
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                      {pagination.total - universities.length} restantes
                    </span>
                  </>
                )}
              </button>
            )}

            {!hasMoreUniversities && universities.length > 0 && (
              <p className="mt-4 py-2 text-center text-xs text-gray-300">
                Todas as {universities.length} universidades carregadas
              </p>
            )}
          </>
        )}

        {/* CTA for suggesting a university */}
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <Link
            href="/sugerir-universidade"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-5 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <Lightbulb size={15} />
            Nao encontrou sua universidade? Sugira aqui
          </Link>
        </div>
      </div>
    </main>
  );
}
