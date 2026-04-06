"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { translateError } from "@/lib/errorMessages";
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
  Trash2,
  Pencil,
  X,
  ShieldX,
  Globe,
  Users,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import StarPicker from "@/components/StarPicker";
import DifficultyPicker from "@/components/DifficultyPicker";
import ImageCarousel from "@/components/ImageCarousel";

// ─── JWT Helper ──────────────────────────────────────────────────────────────

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

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

function unescapeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

function parseComment(raw) {
  if (!raw) return null;
  const unescaped = unescapeHtml(raw);
  try {
    const parsed = JSON.parse(unescaped);
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
  return { structured: false, text: unescaped };
}

const TABS = [
  "Visão Geral",
  "Avaliações",
  "Avaliações Externas",
  "Cursos",
  "Salários",
];
const FILTERS = ["Mais recentes", "Nota alta", "Nota baixa"];
const DEFAULT_FILTER = "Mais recentes";

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 15 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const dim = `${size}px`;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <svg
              key={i}
              style={{ width: dim, height: dim }}
              className="shrink-0 text-tertiary-fixed-dim"
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
              className="shrink-0 text-tertiary-fixed-dim"
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
            className="shrink-0 text-gray-200"
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

// ─── Google Maps Icon ────────────────────────────────────────────────────────

function GoogleMapsIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="#4285F4"
      />
    </svg>
  );
}

// ─── Rating Overview ─────────────────────────────────────────────────────────

function RatingOverview({ stats }) {
  if (!stats || stats.reviewCount === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 text-center">
        <p className="mb-2 font-headline text-2xl font-bold text-primary">
          Sem avaliações
        </p>
        <p className="text-sm text-on-surface-variant">
          Seja o primeiro a avaliar esta universidade!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white">
      <div className="p-6">
        <h2 className="mb-5 font-headline text-lg font-bold text-primary">
          O que dizem os estudantes
        </h2>

        {/* Big rating card */}
        <div className="rounded-2xl bg-primary p-6 text-white">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="font-headline text-5xl font-bold tracking-tight">
                {stats.averageRating}
              </span>
              <span className="ml-1.5 text-sm text-white/60">de 5.0</span>
              <div className="mt-2.5">
                <StarRating rating={stats.averageRating} size={18} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="glass-effect flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                <TrendingUp size={14} />
                {stats.recommendationPercentage}% recomendam
              </span>
              <span className="glass-effect flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                <Users size={14} />
                {stats.reviewCount}{" "}
                {stats.reviewCount === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty bar */}
        {stats.averageDifficultyLevel && (
          <div className="mt-5 flex items-center gap-3">
            <span className="shrink-0 text-sm text-on-surface-variant">
              Dificuldade média
            </span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(stats.averageDifficultyLevel);
                const colorClass = filled
                  ? i < 2
                    ? "bg-green-400"
                    : i < 4
                      ? "bg-tertiary-fixed-dim"
                      : "bg-red-400"
                  : "bg-surface-container";
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${colorClass}`}
                  />
                );
              })}
            </div>
            <span className="text-sm font-semibold text-on-surface">
              {stats.averageDifficultyLevel}/5
            </span>
          </div>
        )}
      </div>

      {/* Trust banner */}
      <div className="flex items-center gap-2.5 border-t border-outline-variant/20 bg-surface-container-low px-6 py-3.5">
        <ShieldCheck size={15} className="shrink-0 text-secondary" />
        <p className="text-xs text-on-surface-variant">
          <span className="font-semibold text-secondary">
            Avaliações 100% reais
          </span>{" "}
          — Universidades não podem alterar ou remover avaliações.
        </p>
      </div>
    </div>
  );
}

// ─── Filter Bar ──────────────────────────────────────────────────────────────

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
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-semibold text-on-surface">
        {hasActiveFilter ? (
          <>
            Ordenando por:{" "}
            <span className="text-secondary">{activeFilter}</span>
          </>
        ) : (
          activeFilter
        )}
      </span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            hasActiveFilter
              ? "bg-secondary-container/20 text-secondary ring-1 ring-inset ring-secondary-container"
              : "bg-white text-on-surface-variant ring-1 ring-inset ring-outline-variant/30 hover:bg-surface-container-low"
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
          <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-lg">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => selectFilter(filter)}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-secondary-container/15 font-semibold text-secondary"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {filter}
                  {isActive && (
                    <svg
                      className="h-3.5 w-3.5 text-secondary"
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

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review, isAdmin, isOwner, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editDifficultyLevel, setEditDifficultyLevel] = useState(
    review.difficultyLevel,
  );
  const [editPros, setEditPros] = useState("");
  const [editCons, setEditCons] = useState("");
  const [editError, setEditError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editRejectionReason, setEditRejectionReason] = useState(null);
  const [showPendingModeration, setShowPendingModeration] = useState(false);

  const authorInitials = getAuthorInitials(review.author);
  const isAnonymous = !review.author;
  const parsedComment = parseComment(review.comment);
  const TRUNCATE_LENGTH = 180;
  const canModify = isOwner || isAdmin;

  function handleLike() {
    setHelpfulCount((count) => (liked ? count - 1 : count + 1));
    setLiked((prev) => !prev);
  }

  function startEditing() {
    setEditRating(review.rating);
    setEditDifficultyLevel(review.difficultyLevel);
    if (parsedComment?.structured) {
      setEditPros(parsedComment.pros);
      setEditCons(parsedComment.cons);
    } else {
      setEditPros(parsedComment?.text || "");
      setEditCons("");
    }
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditError(null);
  }

  async function handleSaveEdit() {
    if (!editRating) {
      setEditError("Escolha uma nota de 1 a 5.");
      return;
    }
    if (!editDifficultyLevel) {
      setEditError("Escolha o nível de dificuldade.");
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      const prosText = editPros.trim();
      const consText = editCons.trim();
      const comment =
        prosText || consText
          ? JSON.stringify({ pros: prosText, cons: consText })
          : undefined;

      const response = await fetchWithAuth(`/api/v1/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          difficultyLevel: editDifficultyLevel,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(data.error?.message, "Erro ao atualizar avaliação."),
        );
      }

      if (data.moderation?.status === "PENDING_MODERATION") {
        setIsEditing(false);
        setShowPendingModeration(true);
        return;
      }

      if (data.moderation) {
        setEditRejectionReason(data.moderation.reason);
        return;
      }

      setIsEditing(false);
      onEdit(review.id, data.review);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`/api/v1/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      onDelete(review.id);
    } catch {
      setIsDeleting(false);
      setDeleteConfirming(false);
    }
  }

  const needsExpand = parsedComment?.structured
    ? !expanded &&
      (parsedComment.pros.length > TRUNCATE_LENGTH ||
        parsedComment.cons.length > TRUNCATE_LENGTH)
    : !expanded && parsedComment?.text?.length > TRUNCATE_LENGTH;

  // ── Edit mode rendering ──
  if (isEditing) {
    return (
      <div className="rounded-2xl border-2 border-secondary-container bg-white p-5">
        {/* Rejection modal for edit */}
        {editRejectionReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-white p-8 text-center shadow-2xl">
              <button
                onClick={() => setEditRejectionReason(null)}
                className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <X size={18} />
              </button>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <ShieldX size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Edição não publicada
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {editRejectionReason}
                </p>
              </div>
              <p className="text-xs text-outline">
                Você pode editar novamente e tentar outra vez.
              </p>
              <button
                onClick={() => setEditRejectionReason(null)}
                className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
              >
                Entendi, vou revisar
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil size={14} className="text-secondary" />
            <span className="text-sm font-semibold text-on-surface">
              Editando avaliação
            </span>
          </div>
          <button
            onClick={cancelEditing}
            className="cursor-pointer rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <X size={16} />
          </button>
        </div>

        {editError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 1 0 2 0V9a1 1 0 1 0-2 0v4zm1-7.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-600">{editError}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface">
              Nota geral
            </label>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low py-4">
              <StarPicker
                value={editRating}
                onChange={setEditRating}
                size="sm"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-semibold text-on-surface">
                Nível de dificuldade
              </label>
              <span className="text-xs text-outline">
                1 = mais fácil, 5 = mais difícil
              </span>
            </div>
            <DifficultyPicker
              value={editDifficultyLevel}
              onChange={setEditDifficultyLevel}
            />
          </div>

          {/* Pros */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <ThumbsUp size={12} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">Prós</span>
              <span className="ml-auto text-xs text-outline">
                {editPros.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={editPros}
              onChange={(event) => setEditPros(event.target.value)}
              placeholder="Pontos positivos..."
              className="w-full resize-none rounded-xl border border-green-200 bg-green-50/50 px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-green-300 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Cons */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <ThumbsDown size={12} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                Contras
              </span>
              <span className="ml-auto text-xs text-outline">
                {editCons.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={editCons}
              onChange={(event) => setEditCons(event.target.value)}
              placeholder="Pontos negativos..."
              className="w-full resize-none rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-xl border border-outline-variant/30 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? (
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
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending moderation after edit ──
  if (showPendingModeration) {
    return (
      <div className="rounded-2xl border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary-fixed-dim/15 text-tertiary-fixed-dim">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface">
              Avaliação em análise
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Sua edição foi recebida e será publicada após a verificação dos
              nossos moderadores.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal display mode ──
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 transition-all duration-200 hover:shadow-md">
      {/* Top row: avatar + rating + verified + difficulty */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
          {isAnonymous ? "?" : authorInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-sm font-semibold text-on-surface">
              {review.rating.toFixed(1)}
            </span>
            {review.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-secondary-container/20 px-2 py-0.5 text-xs font-medium text-secondary">
                <ShieldCheck size={10} />
                Verificado
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-outline">
            <span className="font-medium text-on-surface-variant">
              {isAnonymous ? "Anônimo" : `@${review.author.username}`}
            </span>
            <span className="text-outline-variant">·</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {/* Difficulty badge */}
        <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
          dif. {review.difficultyLevel}/5
        </span>
      </div>

      {/* Comment body */}
      {parsedComment ? (
        <div className="mt-4 space-y-3 pl-[52px]">
          {parsedComment.structured ? (
            <>
              {parsedComment.pros && (
                <div className="rounded-xl border border-green-100 bg-green-50/60 px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <ThumbsUp size={11} className="text-green-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Prós
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">
                    {expanded || parsedComment.pros.length <= TRUNCATE_LENGTH
                      ? parsedComment.pros
                      : parsedComment.pros.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
              {parsedComment.cons && (
                <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <ThumbsDown size={11} className="text-red-500" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Contras
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">
                    {expanded || parsedComment.cons.length <= TRUNCATE_LENGTH
                      ? parsedComment.cons
                      : parsedComment.cons.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="whitespace-pre-line text-sm italic leading-relaxed text-on-surface">
              {expanded || parsedComment.text.length <= TRUNCATE_LENGTH
                ? parsedComment.text
                : parsedComment.text.slice(0, TRUNCATE_LENGTH) + "..."}
            </p>
          )}

          {needsExpand && (
            <button
              onClick={() => setExpanded(true)}
              className="flex cursor-pointer items-center gap-0.5 text-sm font-medium text-secondary hover:opacity-80"
            >
              Ler mais <ChevronDown size={13} />
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 pl-[52px] text-sm italic text-outline">
          Sem comentário.
        </p>
      )}

      {/* Action row */}
      <div className="mt-4 flex items-center gap-2 border-t border-outline-variant/15 pl-[52px] pt-3">
        <button
          onClick={handleLike}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
            liked
              ? "bg-secondary-container/20 text-secondary"
              : "bg-surface-container-low text-outline hover:bg-surface-container"
          }`}
        >
          <ThumbsUp size={13} fill={liked ? "currentColor" : "none"} />
          {helpfulCount > 0 && helpfulCount}
        </button>
        <button className="flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-outline transition-colors hover:bg-surface-container">
          <ThumbsDown size={13} />
        </button>
        <div className="flex-1" />

        {/* Edit button */}
        {isOwner && (
          <button
            onClick={startEditing}
            className="cursor-pointer rounded-full p-2 text-outline transition-colors hover:bg-secondary-container/15 hover:text-secondary"
            title="Editar avaliação"
          >
            <Pencil size={14} />
          </button>
        )}

        <button className="cursor-pointer rounded-full p-2 text-outline transition-colors hover:bg-surface-container hover:text-on-surface-variant">
          <Share2 size={14} />
        </button>
        <button className="cursor-pointer rounded-full p-2 text-outline transition-colors hover:bg-surface-container hover:text-on-surface-variant">
          <Flag size={14} />
        </button>

        {/* Delete button */}
        {canModify && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
              deleteConfirming
                ? "bg-red-500 text-white hover:bg-red-600"
                : "text-red-400 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Trash2 size={13} />
            {isDeleting ? "Removendo..." : deleteConfirming ? "Confirmar" : ""}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── External Review Card ────────────────────────────────────────────────────

function ExternalReviewCard({ review }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container/15 text-secondary">
          <GoogleMapsIcon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-sm font-semibold text-on-surface">
              {review.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-secondary-container/15 px-2 py-0.5 text-xs font-medium text-secondary">
              Google Maps
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-outline">
            <span className="font-medium text-on-surface-variant">
              Avaliador Externo
            </span>
            <span className="text-outline-variant">·</span>
            <span>{formatDate(review.originalDate)}</span>
          </div>
        </div>
      </div>

      {review.textSnippet && (
        <div className="mt-4 pl-[52px]">
          <p className="text-sm italic leading-relaxed text-on-surface">
            {review.textSnippet}
          </p>
        </div>
      )}

      <div className="mt-3 pl-[52px]">
        <a
          href={review.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:opacity-80"
        >
          Ler no Google Maps
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── Sidebar Components ──────────────────────────────────────────────────────

function InfoRapida({ stats, university }) {
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";

  return (
    <div className="overflow-hidden rounded-2xl bg-primary text-white">
      <div className="p-6">
        <h3 className="mb-5 font-headline text-base font-bold">InfoRápida</h3>

        {stats && stats.reviewCount > 0 ? (
          <div className="space-y-5">
            {/* Recommendation percentage */}
            <div className="text-center">
              <div className="font-headline text-4xl font-bold text-tertiary-fixed-dim">
                {stats.recommendationPercentage}%
              </div>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/60">
                Recomendam
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <MessageSquare size={14} />
                  Avaliações
                </span>
                <span className="font-semibold">{stats.reviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <TrendingUp size={14} />
                  Nota média
                </span>
                <span className="font-semibold">{stats.averageRating}/5</span>
              </div>
              {stats.averageDifficultyLevel && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/70">
                    <SlidersHorizontal size={14} />
                    Dificuldade
                  </span>
                  <span className="font-semibold">
                    {stats.averageDifficultyLevel}/5
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Ainda sem avaliações disponíveis.
          </p>
        )}

        {/* Divider */}
        <div className="my-5 h-px bg-white/10" />

        {/* University info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Tipo</span>
            <span className="text-sm font-semibold">{typeLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Localização</span>
            <span className="text-right text-sm font-semibold">
              {university.location}
            </span>
          </div>
          {university.website && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Site</span>
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-semibold text-tertiary-fixed-dim hover:underline"
              >
                <Globe size={12} />
                Visitar
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarCTA({ universityId, universityName }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-white p-6">
      <h3 className="font-headline text-base font-bold text-primary">
        Já estudou na {universityName}?
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant">
        Compartilhe sua experiência e ajude outros estudantes a fazerem a melhor
        escolha.
      </p>
      <Link
        href={`/avaliar?universityId=${universityId}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim px-4 py-3 text-sm font-bold text-primary transition-opacity hover:opacity-90"
      >
        <Pencil size={14} />
        Escrever avaliação
      </Link>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero skeleton */}
      <div className="skeleton h-[400px] w-full" />

      {/* Tabs skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="skeleton h-10 w-96 rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-14 rounded-2xl" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
          <div className="hidden space-y-4 lg:col-span-4 lg:block">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const REVIEWS_PER_PAGE = 10;

export default function UniversityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [university, setUniversity] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [externalReviews, setExternalReviews] = useState([]);
  const [externalReviewsPagination, setExternalReviewsPagination] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingMoreExternal, setIsLoadingMoreExternal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Avaliações");
  const [activeFilter, setActiveFilter] = useState("Mais recentes");
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [following, setFollowing] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeletingUni, setIsDeletingUni] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [uniResponse, reviewsResponse, externalResponse] =
          await Promise.all([
            fetch(`/api/v1/universities/${id}`),
            fetch(
              `/api/v1/reviews?universityId=${id}&limit=${REVIEWS_PER_PAGE}&page=1`,
            ),
            fetch(
              `/api/v1/external-reviews?universityId=${id}&limit=${REVIEWS_PER_PAGE}&page=1`,
            ),
          ]);

        if (!uniResponse.ok) {
          const data = await uniResponse.json();
          throw new Error(
            translateError(data.error?.message, "Universidade não encontrada."),
          );
        }

        const uniData = await uniResponse.json();
        const reviewsData = await reviewsResponse.json();
        const externalData = externalResponse.ok
          ? await externalResponse.json()
          : { data: [], pagination: null };

        setUniversity(uniData);
        setReviews(reviewsData.data ?? []);
        setReviewsPagination(reviewsData.pagination ?? null);
        setExternalReviews(externalData.data ?? []);
        setExternalReviewsPagination(externalData.pagination ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJwtPayload(token);
      if (decoded?.role) setUserRole(decoded.role);
      if (decoded?.id) setUserId(decoded.id);
    }
  }, []);

  const isAdmin = userRole === "ADMIN";

  function handleReviewDelete(reviewId) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  }

  function handleReviewEdit(reviewId, updatedReview) {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? updatedReview : review)),
    );
  }

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

  async function loadMoreExternalReviews() {
    if (!externalReviewsPagination || isLoadingMoreExternal) return;
    const nextPage = externalReviewsPagination.page + 1;
    setIsLoadingMoreExternal(true);
    try {
      const response = await fetch(
        `/api/v1/external-reviews?universityId=${id}&limit=${REVIEWS_PER_PAGE}&page=${nextPage}`,
      );
      const data = await response.json();
      setExternalReviews((prev) => [...prev, ...(data.data ?? [])]);
      setExternalReviewsPagination(data.pagination ?? null);
    } finally {
      setIsLoadingMoreExternal(false);
    }
  }

  async function handleDeleteUniversity() {
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    setIsDeletingUni(true);
    try {
      const response = await fetchWithAuth(`/api/v1/universities/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      router.push("/");
    } catch {
      setIsDeletingUni(false);
      setDeleteConfirming(false);
    }
  }

  const hasMoreReviews =
    reviewsPagination && reviewsPagination.page < reviewsPagination.totalPages;

  const hasMoreExternalReviews =
    externalReviewsPagination &&
    externalReviewsPagination.page < externalReviewsPagination.totalPages;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="font-headline text-lg font-bold text-primary">Oops!</p>
          <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Voltar para universidades
          </button>
        </div>
      </main>
    );
  }

  const initials =
    university.abbreviation || getUniversityInitials(university.name);
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";
  const totalInternalReviews = reviewsPagination?.total || 0;
  const totalExternalReviews = externalReviewsPagination?.total || 0;

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Hero Banner ── */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <ImageCarousel
            images={university.images}
            alt={university.name}
            showArrows={university.images?.length > 1}
            showDots={university.images?.length > 1}
            fallback={
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(135deg, #001337 0%, #0f2854 100%)",
                }}
              />
            }
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back arrow */}
        <div className="absolute left-0 right-0 top-0 z-10 mx-auto max-w-7xl px-6 pt-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Todas as universidades
          </Link>
        </div>

        {/* University info — bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-7xl px-6 pb-8">
            <div className="flex items-end justify-between gap-6">
              {/* Left: Logo + Name + Location */}
              <div className="flex items-end gap-4">
                {/* Logo box */}
                <div className="glass-effect flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-extrabold text-white shadow-lg ring-2 ring-white/20">
                  {initials.slice(0, 3)}
                </div>
                <div className="pb-1">
                  <h1 className="font-headline text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl">
                    {university.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {university.location}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="font-medium text-tertiary-fixed-dim">
                      {typeLabel}
                    </span>
                    {university.website && (
                      <>
                        <span className="text-white/30">·</span>
                        <a
                          href={university.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-white/70 transition-colors hover:text-white"
                        >
                          <Globe size={13} />
                          Site oficial
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Rating badge + Follow + Admin */}
              <div className="hidden items-end gap-3 sm:flex">
                {/* Rating badge */}
                {university.stats?.averageRating && (
                  <div className="glass-effect flex flex-col items-center rounded-2xl bg-tertiary-fixed-dim/90 px-5 py-3 text-primary shadow-lg">
                    <span className="font-headline text-2xl font-bold">
                      {university.stats.averageRating}
                    </span>
                    <div className="mt-0.5">
                      <StarRating
                        rating={university.stats.averageRating}
                        size={12}
                      />
                    </div>
                  </div>
                )}

                {/* Follow button */}
                <button
                  onClick={() => setFollowing((prev) => !prev)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    following
                      ? "border border-white/30 bg-white/10 text-white"
                      : "bg-white text-primary hover:bg-white/90"
                  }`}
                >
                  <Heart size={14} fill={following ? "currentColor" : "none"} />
                  {following ? "Seguindo" : "Seguir"}
                </button>

                {/* Admin delete */}
                {isAdmin && (
                  <button
                    onClick={handleDeleteUniversity}
                    disabled={isDeletingUni}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${
                      deleteConfirming
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "border border-red-300/50 text-red-300 hover:bg-red-500/20"
                    }`}
                  >
                    <Trash2 size={14} />
                    {isDeletingUni
                      ? "Removendo..."
                      : deleteConfirming
                        ? "Confirmar"
                        : ""}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs Navigation ── */}
      <nav className="border-b border-outline-variant/20 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const reviewCount =
                tab === "Avaliações" && totalInternalReviews > 0
                  ? totalInternalReviews
                  : tab === "Avaliações Externas" && totalExternalReviews > 0
                    ? totalExternalReviews
                    : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-b-2 border-primary font-bold text-primary"
                      : "border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab}
                  {reviewCount !== null && (
                    <span className="ml-1.5 text-xs text-outline">
                      ({reviewCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile actions (visible below tabs on small screens) ── */}
      <div className="border-b border-outline-variant/20 bg-white px-6 py-3 sm:hidden">
        <div className="flex items-center gap-3">
          {university.stats?.averageRating && (
            <div className="flex items-center gap-2 rounded-full bg-tertiary-fixed-dim/10 px-3 py-1.5">
              <span className="font-headline text-sm font-bold text-primary">
                {university.stats.averageRating}
              </span>
              <StarRating rating={university.stats.averageRating} size={12} />
            </div>
          )}
          <button
            onClick={() => setFollowing((prev) => !prev)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              following
                ? "border border-secondary-container bg-secondary-container/10 text-secondary"
                : "bg-primary text-on-primary"
            }`}
          >
            <Heart size={14} fill={following ? "currentColor" : "none"} />
            {following ? "Seguindo" : "Seguir"}
          </button>
          <div className="flex-1" />
          <Link
            href={`/avaliar?universityId=${id}`}
            className="rounded-full bg-tertiary-fixed-dim px-4 py-2 text-sm font-bold text-primary transition-opacity hover:opacity-90"
          >
            Avaliar
          </Link>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main column */}
          <div className="lg:col-span-8">
            {activeTab === "Avaliações" && (
              <div className="space-y-4">
                <RatingOverview stats={university.stats} />
                <FilterBar
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />

                {sortedReviews.length === 0 ? (
                  <div className="rounded-2xl border border-outline-variant/20 bg-white p-10 text-center">
                    <p className="font-headline text-lg font-bold text-primary">
                      Nenhuma avaliação ainda
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Seja o primeiro a avaliar!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {sortedReviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          isAdmin={isAdmin}
                          isOwner={
                            userId !== null && review.authorId === userId
                          }
                          onDelete={handleReviewDelete}
                          onEdit={handleReviewEdit}
                        />
                      ))}
                    </div>

                    {hasMoreReviews && (
                      <button
                        onClick={loadMoreReviews}
                        disabled={isLoadingMore}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-white py-3.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-secondary-container hover:text-secondary disabled:opacity-60"
                      >
                        {isLoadingMore ? (
                          <>
                            <LoadingSpinner />
                            Carregando...
                          </>
                        ) : (
                          <>
                            Carregar mais avaliações
                            <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-outline">
                              {reviewsPagination.total - reviews.length}{" "}
                              restantes
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    {!hasMoreReviews && reviews.length > 0 && (
                      <p className="py-2 text-center text-xs text-outline">
                        Todas as {reviews.length} avaliações carregadas
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "Avaliações Externas" && (
              <div className="space-y-4">
                {/* External reviews stats header */}
                {university.externalStats && (
                  <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white">
                    <div className="p-6">
                      <h2 className="mb-5 font-headline text-lg font-bold text-primary">
                        Avaliações do Google Maps
                      </h2>
                      <div className="flex items-center gap-4">
                        <GoogleMapsIcon size={24} />
                        <div className="flex items-center gap-3">
                          <span className="font-headline text-3xl font-bold text-primary">
                            {university.externalStats.averageRating}
                          </span>
                          <div>
                            <StarRating
                              rating={university.externalStats.averageRating}
                              size={16}
                            />
                            <p className="mt-0.5 text-xs text-outline">
                              {university.externalStats.reviewCount}{" "}
                              {university.externalStats.reviewCount === 1
                                ? "avaliação"
                                : "avaliações"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 border-t border-outline-variant/20 bg-surface-container-low px-6 py-3">
                      <GoogleMapsIcon size={14} />
                      <Link
                        href="/sobre/avaliacoes-externas"
                        className="text-xs text-secondary hover:underline"
                      >
                        Saiba mais sobre avaliações externas
                      </Link>
                    </div>
                  </div>
                )}

                {externalReviews.length === 0 ? (
                  <div className="rounded-2xl border border-outline-variant/20 bg-white p-10 text-center">
                    <p className="font-headline text-lg font-bold text-primary">
                      Nenhuma avaliação externa
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Ainda não há avaliações do Google Maps para esta
                      universidade.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {externalReviews.map((review) => (
                        <ExternalReviewCard key={review.id} review={review} />
                      ))}
                    </div>

                    {hasMoreExternalReviews && (
                      <button
                        onClick={loadMoreExternalReviews}
                        disabled={isLoadingMoreExternal}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-white py-3.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-secondary-container hover:text-secondary disabled:opacity-60"
                      >
                        {isLoadingMoreExternal ? (
                          <>
                            <LoadingSpinner />
                            Carregando...
                          </>
                        ) : (
                          <>
                            Carregar mais avaliações externas
                            <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-outline">
                              {externalReviewsPagination.total -
                                externalReviews.length}{" "}
                              restantes
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    {!hasMoreExternalReviews && externalReviews.length > 0 && (
                      <p className="py-2 text-center text-xs text-outline">
                        Todas as {externalReviews.length} avaliações externas
                        carregadas
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "Visão Geral" && (
              <div className="space-y-6">
                <RatingOverview stats={university.stats} />

                {/* University details card */}
                <div className="rounded-2xl border border-outline-variant/20 bg-white p-6">
                  <h2 className="mb-4 font-headline text-lg font-bold text-primary">
                    Sobre a instituição
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4">
                      <MapPin
                        size={18}
                        className="shrink-0 text-on-surface-variant"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-outline">
                          Localização
                        </p>
                        <p className="text-sm font-semibold text-on-surface">
                          {university.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4">
                      <Users
                        size={18}
                        className="shrink-0 text-on-surface-variant"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-widest text-outline">
                          Tipo
                        </p>
                        <p className="text-sm font-semibold text-on-surface">
                          {typeLabel}
                        </p>
                      </div>
                    </div>
                    {university.website && (
                      <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4 sm:col-span-2">
                        <Globe
                          size={18}
                          className="shrink-0 text-on-surface-variant"
                        />
                        <div>
                          <p className="text-xs uppercase tracking-widest text-outline">
                            Website
                          </p>
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-secondary hover:underline"
                          >
                            {university.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "Avaliações" &&
              activeTab !== "Visão Geral" &&
              activeTab !== "Avaliações Externas" && (
                <div className="rounded-2xl border border-outline-variant/20 bg-white p-10 text-center">
                  <p className="font-headline text-lg font-bold text-primary">
                    Em breve
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Estamos trabalhando nesta funcionalidade.
                  </p>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              <InfoRapida stats={university.stats} university={university} />
              <SidebarCTA
                universityId={id}
                universityName={
                  university.abbreviation ||
                  university.name.split(" ").slice(0, 3).join(" ")
                }
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
