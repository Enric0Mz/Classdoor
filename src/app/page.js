"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  MapPin,
  Plus,
  PenLine,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";

const ITEMS_PER_PAGE = 15;
const FILTER_CHIPS = [
  "Em alta",
  "Top rated",
  "Públicas",
  "Privadas",
  "Destaque",
];

function RecommendationCard({ university }) {
  return (
    <div className="group overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-300 hover:shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.08)]">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <ImageCarousel
          images={university.images}
          alt={university.name}
          className="transition-transform duration-500 group-hover:scale-110"
          showArrows={false}
          showDots={false}
          fallback={
            <div className="h-full w-full bg-gradient-to-br from-slate-800 via-indigo-900 to-violet-900" />
          }
        />

      </div>

      {/* Content */}
      <div className="p-8">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h3 className="font-headline text-xl font-bold leading-tight text-primary">
            {university.name}
          </h3>
          {university.rating != null && (
            <div className="flex shrink-0 items-center text-tertiary-fixed-dim">
              <Star size={16} className="fill-current" />
              <span className="ml-1 text-sm font-bold text-on-surface">
                {university.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant">
          <MapPin size={14} />
          {university.location || "Brasil"}
        </div>

        <p className="mb-6 text-sm text-on-surface-variant">
          {university.reviewCount > 0
            ? `${university.reviewCount} ${university.reviewCount === 1 ? "avaliação" : "avaliações"}`
            : "Sem avaliações ainda"}
        </p>

        <Link
          href={`/universities/${university.id}`}
          className="block w-full rounded-lg border border-outline-variant/30 py-3 text-center text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [universities, setUniversities] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState("Em alta");
  const [currentPage, setCurrentPage] = useState(1);
  const universitiesTopRef = useRef(null);
  const isFirstRender = useRef(true);

  const [platformStats, setPlatformStats] = useState(null);

  const totalCount = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((response) => response.json())
      .then((data) => setPlatformStats(data))
      .catch(() => {});
  }, []);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        page: String(currentPage),
      });
      const response = await fetch(`/api/v1/universities?${params}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setUniversities(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      // silent fail — page still renders
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  // Scroll to top of university list when page changes (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    universitiesTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages - 1, startPage + 2);
    const adjustedStart = Math.max(1, endPage - 2);

    for (let page = adjustedStart; page <= endPage; page++) {
      pages.push(page);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="flex min-h-screen flex-col bg-background pt-16">
      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[870px] items-center overflow-hidden">
        {/* Background image + overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-banner.jpg"
            alt="Campus universitário"
            className="h-full w-full object-cover opacity-40 grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="mb-6 inline-block rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim">
              Curadoria de Excelência
            </span>

            {/* Heading */}
            <h1 className="font-headline mb-8 text-5xl font-bold leading-tight text-white md:text-7xl">
              Encontre a universidade perfeita para você.
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <div className="glass-effect flex items-center rounded-xl border border-white/20 bg-surface-container-lowest p-2 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-secondary/20">
                <Search
                  size={24}
                  className="mx-4 shrink-0 text-secondary"
                />
                <input
                  type="text"
                  placeholder="Qual curso ou instituição você procura?"
                  className="flex-grow border-none bg-transparent py-4 text-lg text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0"
                />
                <button className="shrink-0 cursor-pointer rounded-lg bg-tertiary-fixed-dim px-8 py-4 font-bold text-primary transition-all hover:brightness-110">
                  Pesquisar
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-10">
              <div className="flex flex-col">
                <span className="font-headline text-3xl font-bold text-white">
                  +{platformStats?.universityCount ?? (totalCount || "...")}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Universidades
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-3xl font-bold text-white">
                  {platformStats?.averageRating ?? "..."}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Nota Média
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-3xl font-bold text-white">
                  {platformStats
                    ? `${platformStats.reviewCount}+`
                    : "..."}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                  Avaliações
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Badges ── */}
      <section className="bg-surface-container-low py-12">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="mr-4 text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
              Filtrar por:
            </span>
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  activeChip === chip
                    ? "bg-secondary-container font-bold text-on-secondary-container hover:brightness-95"
                    : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section
        ref={universitiesTopRef}
        className="mx-auto max-w-7xl px-8 py-24"
      >
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-headline mb-2 text-4xl font-bold text-primary">
              Recomendações para você
            </h2>
            <p className="max-w-xl text-on-surface-variant">
              Instituições que se destacam por sua excelência acadêmica e
              infraestrutura de ponta avaliadas por nossa comunidade.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl bg-surface-container-lowest"
              >
                <div className="skeleton h-56 w-full" />
                <div className="p-8">
                  <div className="skeleton mb-4 h-6 w-3/4 rounded" />
                  <div className="skeleton mb-6 h-4 w-1/2 rounded" />
                  <div className="skeleton h-12 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : universities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">
              Nenhuma universidade encontrada
            </h3>
            <p className="max-w-xs text-on-surface-variant">
              Tente novamente mais tarde.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {universities.map((university) => (
                <RecommendationCard
                  key={university.id}
                  university={university}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                {visiblePageNumbers.map((pageNumber, index) =>
                  pageNumber === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-10 w-10 items-center justify-center text-sm text-on-surface-variant"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        currentPage === pageNumber
                          ? "bg-primary text-white shadow-md"
                          : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── CTA Section ── */}
      <section className="mb-24 px-8">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 overflow-hidden rounded-3xl bg-primary p-12 md:flex-row">
          {/* Background decorative icon */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-10">
            <GraduationCap
              size={300}
              className="-rotate-12 translate-x-20 translate-y-20"
            />
          </div>

          <div className="relative z-10 flex-1">
            <h2 className="font-headline mb-4 text-4xl font-bold text-white">
              Não encontrou sua uni?
            </h2>
            <p className="mb-8 max-w-lg text-lg text-on-primary-container">
              Ajude outros estudantes compartilhando sua experiência ou
              sugerindo novas instituições para nossa base de dados.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sugerir-universidade"
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-tertiary-fixed-dim px-8 py-4 font-bold text-primary transition-transform hover:scale-105"
              >
                <Plus size={18} />
                Adicionar Universidade
              </Link>
              <Link
                href="/avaliar"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur transition-all hover:bg-white/20"
              >
                Escrever Avaliação
              </Link>
            </div>
          </div>

          {/* Decorative concentric circles */}
          <div className="relative z-10 hidden lg:block">
            <div className="rounded-full border border-white/5 bg-surface-container-lowest/10 p-8">
              <div className="rounded-full border border-white/10 bg-surface-container-lowest/10 p-8">
                <PenLine size={56} className="text-tertiary-fixed-dim" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
