"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Heart, ThumbsUp, ThumbsDown, Share2, Flag,
  ShieldCheck, SlidersHorizontal, ChevronDown, ArrowLeft,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUniversityInitials(name) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || name.slice(0, 3).toUpperCase();
}

function getAuthorInitials(author) {
  if (!author?.username) return "?";
  return author.username.slice(0, 2).toUpperCase();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parseComment(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.pros || parsed.cons)) {
      return { structured: true, pros: parsed.pros || "", cons: parsed.cons || "" };
    }
  } catch {
    // not JSON — fall through to plain text
  }
  return { structured: false, text: raw };
}

const TABS = ["Visão geral 👀", "Avaliações ⭐", "Cursos 📖", "Salários 💸"];
const FILTERS = ["Mais recentes", "Nota alta", "Nota baixa"];

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 15 }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const starClass = `shrink-0 text-yellow-400`;
  const dim = `${size}px`;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return (
            <svg key={i} style={{ width: dim, height: dim }} className={starClass} viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }
        if (i === full && hasHalf) {
          return (
            <svg key={i} style={{ width: dim, height: dim }} className={starClass} viewBox="0 0 20 20">
              <defs>
                <linearGradient id={`h-${i}-${rating}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path fill={`url(#h-${i}-${rating})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }
        return (
          <svg key={i} style={{ width: dim, height: dim }} className="shrink-0 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

// ─── University Header ────────────────────────────────────────────────────────

function UniversityHeader({ university, activeTab, onTabChange }) {
  const [following, setFollowing] = useState(false);
  const initials = getUniversityInitials(university.name);
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Banner */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        {university.image ? (
          <img src={university.image} alt={university.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full brand-gradient" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.55) 0%, transparent 60%)" }}
        />
      </div>

      {/* Info area */}
      <div className="relative -mt-10 px-5 pb-0 sm:px-6">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="brand-gradient flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white text-[1.1rem] font-extrabold text-white shadow-lg">
            {initials.slice(0, 3)}
          </div>

          {/* Name + follow */}
          <div className="flex flex-1 flex-wrap items-start justify-between gap-3 pb-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">{university.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gray-400" />
                  {university.location}
                </span>
                <span className="text-gray-300">•</span>
                <span className="font-medium text-indigo-600">{typeLabel}</span>
                {university.website && (
                  <>
                    <span className="text-gray-300">•</span>
                    <a href={university.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                      Site oficial
                    </a>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setFollowing((prev) => !prev)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                following
                  ? "border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  : "brand-gradient border-2 border-transparent text-white hover:opacity-90"
              }`}
            >
              <Heart size={14} fill={following ? "#6366f1" : "none"} />
              {following ? "Seguindo" : "Seguir"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="-mx-5 mt-3 overflow-x-auto sm:-mx-6">
          <div className="flex min-w-max border-t border-gray-100 px-5 sm:px-6">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2.5 text-[0.82rem] font-medium transition-colors ${
                    isActive
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "border-b-2 border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rating Overview ──────────────────────────────────────────────────────────

function RatingOverview({ stats }) {
  if (!stats || stats.reviewCount === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center text-sm text-gray-400">
        Ainda não há avaliações para esta universidade.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">O que a galera acha? 🤔</h2>
        </div>

        {/* Big rating */}
        <div className="brand-gradient rounded-2xl p-5 text-white">
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <span className="text-5xl font-extrabold tracking-tight">{stats.averageRating}</span>
              <span className="ml-1 text-white/70 text-sm">de 5.0</span>
              <div className="mt-2">
                <StarRating rating={stats.averageRating} size={18} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                📈 {stats.recommendationPercentage}% recomendam
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                👥 {stats.reviewCount} {stats.reviewCount === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        {stats.averageDifficultyLevel && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-500">Dificuldade média</span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < Math.round(stats.averageDifficultyLevel) ? "bg-indigo-400" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{stats.averageDifficultyLevel}</span>
          </div>
        )}
      </div>

      {/* Trust banner */}
      <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3 flex items-center gap-2.5">
        <ShieldCheck size={15} className="shrink-0 text-indigo-500" />
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-indigo-600">Avaliações 100% reais 🔒</span>
          {" "}Universidades não podem alterar ou remover avaliações. Confiança é tudo!
        </p>
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const DEFAULT_FILTER = "Mais recentes";

function FilterBar({ activeFilter, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hasActiveFilter = activeFilter !== DEFAULT_FILTER;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectFilter(filter) {
    onFilterChange(filter);
    setIsOpen(false);
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <span className="text-[0.82rem] text-gray-400">
        {hasActiveFilter ? (
          <>Ordenando por: <span className="font-semibold text-indigo-600">{activeFilter}</span></>
        ) : (
          <span className="text-gray-500 font-medium">{`${activeFilter}`}</span>
        )}
      </span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-1.5 text-[0.8rem] font-medium transition-all ${
            hasActiveFilter
              ? "border border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <SlidersHorizontal size={13} />
          Ordenar
          <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => selectFilter(filter)}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-[0.82rem] transition-colors ${
                    isActive
                      ? "bg-indigo-50 font-semibold text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                  {isActive && (
                    <svg className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const authorInitials = getAuthorInitials(review.author);
  const isAnonymous = !review.author;
  const parsedComment = parseComment(review.comment);
  const TRUNCATE_LENGTH = 180;

  function handleLike() {
    setHelpfulCount((c) => (liked ? c - 1 : c + 1));
    setLiked((prev) => !prev);
  }

  const needsExpand = parsedComment?.structured
    ? (!expanded && (parsedComment.pros.length > TRUNCATE_LENGTH || parsedComment.cons.length > TRUNCATE_LENGTH))
    : (!expanded && parsedComment?.text?.length > TRUNCATE_LENGTH);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">

      {/* Top row: avatar + rating + verified */}
      <div className="flex items-start gap-3">
        <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[0.85rem] font-bold text-white">
          {isAnonymous ? "👤" : authorInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-[0.82rem] font-semibold text-gray-700">{review.rating.toFixed(1)}</span>
            {review.author?.verified && (
              <span className="flex items-center gap-1 text-[0.72rem] text-indigo-500">
                <ShieldCheck size={11} />
                Verificado
              </span>
            )}
          </div>

          {/* Author + date */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.75rem] text-gray-400">
            <span className="font-medium text-gray-600">
              {isAnonymous ? "Anônimo" : `@${review.author.username}`}
            </span>
            <span className="text-gray-300">•</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Difficulty badge */}
        <span className="shrink-0 rounded-lg bg-gray-50 px-2.5 py-1 text-[0.72rem] text-gray-500">
          Dif. {review.difficultyLevel}/5
        </span>
      </div>

      {/* Comment body */}
      {parsedComment ? (
        <div className="mt-4 pl-[52px] space-y-3">
          {parsedComment.structured ? (
            <>
              {parsedComment.pros && (
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-xs">✅</span>
                    <span className="text-xs font-semibold text-green-700">Prós</span>
                  </div>
                  <p className="text-[0.85rem] leading-relaxed text-gray-700">
                    {expanded || parsedComment.pros.length <= TRUNCATE_LENGTH
                      ? parsedComment.pros
                      : parsedComment.pros.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
              {parsedComment.cons && (
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-xs">⚠️</span>
                    <span className="text-xs font-semibold text-amber-700">Contras</span>
                  </div>
                  <p className="text-[0.85rem] leading-relaxed text-gray-700">
                    {expanded || parsedComment.cons.length <= TRUNCATE_LENGTH
                      ? parsedComment.cons
                      : parsedComment.cons.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-[0.85rem] leading-relaxed text-gray-700">
              {expanded || parsedComment.text.length <= TRUNCATE_LENGTH
                ? parsedComment.text
                : parsedComment.text.slice(0, TRUNCATE_LENGTH) + "..."}
            </p>
          )}

          {needsExpand && (
            <button
              onClick={() => setExpanded(true)}
              className="flex cursor-pointer items-center gap-0.5 text-[0.82rem] font-medium text-indigo-500 hover:opacity-80"
            >
              Ler mais <ChevronDown size={13} />
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 pl-[52px] text-[0.82rem] italic text-gray-300">Sem comentário.</p>
      )}

      {/* Action row */}
      <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3 pl-[52px]">
        <button
          onClick={handleLike}
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-[0.8rem] transition-all ${
            liked ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          }`}
        >
          <ThumbsUp size={13} fill={liked ? "currentColor" : "none"} />
          {helpfulCount > 0 && helpfulCount}
        </button>
        <button className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-1.5 text-[0.8rem] text-gray-400 transition-colors hover:bg-gray-100">
          <ThumbsDown size={13} />
        </button>
        <div className="flex-1" />
        <button className="cursor-pointer rounded-xl p-2 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500">
          <Share2 size={14} />
        </button>
        <button className="cursor-pointer rounded-xl p-2 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500">
          <Flag size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-14 animate-pulse rounded-2xl bg-gray-100" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UniversityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [university, setUniversity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Avaliações ⭐");
  const [activeFilter, setActiveFilter] = useState("Mais recentes");

  useEffect(() => {
    async function fetchUniversity() {
      try {
        const response = await fetch(`/api/v1/universities/${id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || "Universidade não encontrada.");
        }
        const data = await response.json();
        setUniversity(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUniversity();
  }, [id]);

  const sortedReviews = useMemo(() => {
    if (!university?.reviews) return [];
    const reviews = [...university.reviews];
    if (activeFilter === "Nota alta") return reviews.sort((a, b) => b.rating - a.rating);
    if (activeFilter === "Nota baixa") return reviews.sort((a, b) => a.rating - b.rating);
    return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [university, activeFilter]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Skeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => router.push("/universities")}
            className="brand-gradient mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voltar para universidades
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Top bar: back + CTA */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={14} />
          Todas as universidades
        </Link>
        <Link
          href={`/avaliar?universityId=${id}`}
          className="brand-gradient flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          ⭐ Avaliar
        </Link>
      </div>

      <div className="space-y-4">
        <UniversityHeader
          university={university}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "Avaliações ⭐" && (
          <>
            <RatingOverview stats={university.stats} />
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            {sortedReviews.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                Nenhuma avaliação ainda. Seja o primeiro! 🎓
              </div>
            ) : (
              <div className="space-y-3">
                {sortedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab !== "Avaliações ⭐" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
            Em breve. 🚧
          </div>
        )}
      </div>
    </main>
  );
}
