"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  ShieldCheck,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUniversityInitials(name) {
  return (
    name
      .split(" ")
      .filter((word) => word.length > 2)
      .slice(0, 3)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || name.slice(0, 3).toUpperCase()
  );
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
      return {
        structured: true,
        pros: parsed.pros || "",
        cons: parsed.cons || "",
      };
    }
  } catch {
    // not JSON — fall through to plain text
  }
  return { structured: false, text: raw };
}

const TABS = ["Visão geral 👀", "Avaliações ⭐", "Cursos 📖", "Salários 💸"];
const FILTERS = ["Mais recentes", "Nota alta", "Nota baixa"];
const DEFAULT_FILTER = "Mais recentes";

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 15 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const dim = `${size}px`;
  const yellowClass = "shrink-0 text-yellow-400";
  const grayClass = "shrink-0 text-gray-200";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <svg
              key={i}
              style={{ width: dim, height: dim }}
              className={yellowClass}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <svg
              key={i}
              style={{ width: dim, height: dim }}
              className={yellowClass}
              viewBox="0 0 20 20"
            >
              <defs>
                <linearGradient id={`h-${i}-${rating}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#h-${i}-${rating})`}
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          );
        }
        return (
          <svg
            key={i}
            style={{ width: dim, height: dim }}
            className={grayClass}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg">
      {/* Banner — logo + name are both inside, white on dark = perfect readability */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        {university.image ? (
          <img
            src={university.image}
            alt={university.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 via-indigo-900 to-violet-900" />
        )}
        {/* Bottom-heavy gradient so logo + name are always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Logo + name anchored to banner bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 px-5 pb-5 sm:px-6">
          {/* Initials logo */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-extrabold text-white shadow-inner backdrop-blur-md ring-2 ring-white/25">
            {initials.slice(0, 3)}
          </div>
          {/* Name */}
          <div className="min-w-0 flex-1 pb-0.5">
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow-md sm:text-2xl">
              {university.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Info strip: meta row + follow button */}
      <div className="px-5 sm:px-6">
        <div className="flex items-center gap-3 py-3.5 border-b border-gray-100">
          {/* Location + type + website */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="shrink-0 text-gray-400" />
              <span>{university.location}</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-medium text-indigo-600">{typeLabel}</span>
            {university.website && (
              <>
                <span className="text-gray-300">•</span>
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline"
                >
                  Site oficial
                </a>
              </>
            )}
          </div>

          {/* Follow button */}
          <button
            onClick={() => setFollowing((prev) => !prev)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              following
                ? "border border-indigo-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                : "brand-gradient border border-transparent text-white hover:opacity-90"
            }`}
          >
            <Heart size={14} fill={following ? "#6366f1" : "none"} />
            {following ? "Seguindo" : "Seguir"}
          </button>
        </div>

        {/* Tabs */}
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <div className="flex min-w-max px-5 sm:px-6">
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
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
        <p className="text-2xl mb-2">🎓</p>
        <p className="text-sm font-medium text-gray-500">
          Ainda não há avaliações.
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          Seja o primeiro a avaliar esta universidade!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          O que a galera acha? 🤔
        </h2>

        {/* Big rating */}
        <div className="brand-gradient rounded-2xl p-5 text-white">
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <span className="text-5xl font-extrabold tracking-tight">
                {stats.averageRating}
              </span>
              <span className="ml-1 text-sm text-white/70">de 5.0</span>
              <div className="mt-2">
                <StarRating rating={stats.averageRating} size={18} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                📈 {stats.recommendationPercentage}% recomendam
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-medium backdrop-blur-sm">
                👥 {stats.reviewCount}{" "}
                {stats.reviewCount === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        {stats.averageDifficultyLevel && (
          <div className="mt-4 flex items-center gap-3">
            <span className="shrink-0 text-sm text-gray-500">
              Dificuldade média
            </span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(stats.averageDifficultyLevel);
                const colorClass = filled
                  ? i < 2
                    ? "bg-green-400"
                    : i < 4
                      ? "bg-amber-400"
                      : "bg-red-400"
                  : "bg-gray-100";
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${colorClass}`}
                  />
                );
              })}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {stats.averageDifficultyLevel}/5
            </span>
          </div>
        )}
      </div>

      {/* Trust banner */}
      <div className="flex items-center gap-2.5 border-t border-gray-100 bg-gray-50/40 px-5 py-3">
        <ShieldCheck size={15} className="shrink-0 text-indigo-500" />
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-indigo-600">
            Avaliações 100% reais 🔒
          </span>{" "}
          Universidades não podem alterar ou remover avaliações. Confiança é
          tudo!
        </p>
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

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
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-semibold text-gray-700">
        {hasActiveFilter ? (
          <>
            Ordenando por:{" "}
            <span className="text-indigo-600">{activeFilter}</span>
          </>
        ) : (
          activeFilter
        )}
      </span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-medium transition-all ${
            hasActiveFilter
              ? "bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200"
              : "bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-200"
          }`}
        >
          <SlidersHorizontal size={13} />
          Ordenar
          <ChevronDown
            size={13}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
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
                    <svg
                      className="h-3.5 w-3.5 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
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
    setHelpfulCount((count) => (liked ? count - 1 : count + 1));
    setLiked((prev) => !prev);
  }

  const needsExpand = parsedComment?.structured
    ? !expanded &&
      (parsedComment.pros.length > TRUNCATE_LENGTH ||
        parsedComment.cons.length > TRUNCATE_LENGTH)
    : !expanded && parsedComment?.text?.length > TRUNCATE_LENGTH;

  return (
    <div className="card-glow rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md">
      {/* Top row: avatar + rating + verified + difficulty */}
      <div className="flex items-start gap-3">
        <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[0.85rem] font-bold text-white">
          {isAnonymous ? "👤" : authorInitials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-[0.82rem] font-semibold text-gray-700">
              {review.rating.toFixed(1)}
            </span>
            {review.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[0.7rem] font-medium text-indigo-600">
                <ShieldCheck size={10} />
                Verificado
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.75rem] text-gray-400">
            <span className="font-medium text-gray-600">
              {isAnonymous ? "Anônimo" : `@${review.author.username}`}
            </span>
            <span className="text-gray-300">•</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Difficulty badge */}
        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[0.7rem] font-medium text-gray-500">
          dif. {review.difficultyLevel}/5
        </span>
      </div>

      {/* Comment body */}
      {parsedComment ? (
        <div className="mt-4 pl-[52px] space-y-3">
          {parsedComment.structured ? (
            <>
              {parsedComment.pros && (
                <div className="rounded-xl border border-green-100 bg-green-50/60 px-3.5 py-2.5">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">✅</span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-green-700">
                      Prós
                    </span>
                  </div>
                  <p className="text-[0.85rem] leading-relaxed text-gray-700">
                    {expanded || parsedComment.pros.length <= TRUNCATE_LENGTH
                      ? parsedComment.pros
                      : parsedComment.pros.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
              {parsedComment.cons && (
                <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3.5 py-2.5">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">⚠️</span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-amber-700">
                      Contras
                    </span>
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
        <p className="mt-4 pl-[52px] text-[0.82rem] italic text-gray-300">
          Sem comentário.
        </p>
      )}

      {/* Action row */}
      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 pl-[52px]">
        <button
          onClick={handleLike}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] transition-all ${
            liked
              ? "bg-indigo-50 text-indigo-600"
              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          }`}
        >
          <ThumbsUp size={13} fill={liked ? "currentColor" : "none"} />
          {helpfulCount > 0 && helpfulCount}
        </button>
        <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-[0.8rem] text-gray-400 transition-colors hover:bg-gray-100">
          <ThumbsDown size={13} />
        </button>
        <div className="flex-1" />
        <button className="cursor-pointer rounded-full p-2 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500">
          <Share2 size={14} />
        </button>
        <button className="cursor-pointer rounded-full p-2 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500">
          <Flag size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-40 rounded-2xl" />
      <div className="skeleton h-14 rounded-2xl" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-40 rounded-2xl" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const REVIEWS_PER_PAGE = 10;

export default function UniversityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [university, setUniversity] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Avaliações ⭐");
  const [activeFilter, setActiveFilter] = useState("Mais recentes");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [uniResponse, reviewsResponse] = await Promise.all([
          fetch(`/api/v1/universities/${id}`),
          fetch(
            `/api/v1/reviews?universityId=${id}&limit=${REVIEWS_PER_PAGE}&page=1`,
          ),
        ]);

        if (!uniResponse.ok) {
          const data = await uniResponse.json();
          throw new Error(
            data.error?.message || "Universidade não encontrada.",
          );
        }

        const uniData = await uniResponse.json();
        const reviewsData = await reviewsResponse.json();

        setUniversity(uniData);
        setReviews(reviewsData.data ?? []);
        setReviewsPagination(reviewsData.pagination ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, [id]);

  async function loadMoreReviews() {
    if (!reviewsPagination || isLoadingMore) return;
    const nextPage = reviewsPagination.page + 1;
    setIsLoadingMore(true);
    try {
      const response = await fetch(
        `/api/v1/reviews?universityId=${id}&limit=${REVIEWS_PER_PAGE}&page=${nextPage}`,
      );
      const data = await response.json();
      setReviews((prev) => [...prev, ...(data.data ?? [])]);
      setReviewsPagination(data.pagination ?? null);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    if (activeFilter === "Nota alta")
      return copy.sort((a, b) => b.rating - a.rating);
    if (activeFilter === "Nota baixa")
      return copy.sort((a, b) => a.rating - b.rating);
    return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, activeFilter]);

  const hasMoreReviews =
    reviewsPagination && reviewsPagination.page < reviewsPagination.totalPages;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <PageSkeleton />
        </div>
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
            className="brand-gradient mt-4 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voltar para universidades
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Dark hero strip ── */}
      <div
        className="relative overflow-hidden pb-8 pt-6"
        style={{ backgroundColor: "#0f0f14" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-30" />

        {/* Radial purple glow */}
        <div
          className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          {/* Back + CTA */}
          <div className="mb-5 flex items-center justify-between">
            <Link
              href="/universities"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-indigo-400"
            >
              <ArrowLeft size={14} />
              Todas as universidades
            </Link>
            <Link
              href={`/avaliar?universityId=${id}`}
              className="brand-gradient flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              ⭐ Avaliar
            </Link>
          </div>

          {/* University header card floats on dark bg */}
          <UniversityHeader
            university={university}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Bottom gradient fade into light content */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-4 sm:px-6">
        <div className="space-y-4">
          {activeTab === "Avaliações ⭐" && (
            <>
              <RatingOverview stats={university.stats} />
              <FilterBar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {sortedReviews.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                  <p className="mb-2 text-2xl">🎓</p>
                  <p className="text-sm font-medium text-gray-500">
                    Nenhuma avaliação ainda.
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Seja o primeiro a avaliar!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {sortedReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {hasMoreReviews && (
                    <button
                      onClick={loadMoreReviews}
                      disabled={isLoadingMore}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-3.5 text-sm font-medium text-gray-500 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-60"
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
                          Carregar mais avaliações
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                            {reviewsPagination.total - reviews.length} restantes
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {!hasMoreReviews && reviews.length > 0 && (
                    <p className="py-2 text-center text-xs text-gray-300">
                      Todas as {reviews.length} avaliações carregadas
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {activeTab !== "Avaliações ⭐" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
              Em breve. 🚧
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
