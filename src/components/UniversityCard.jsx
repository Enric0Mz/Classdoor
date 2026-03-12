"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Star, Trash2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

function getInitials(name) {
  return name
    .split(" ")
    .filter((word) => word.length > 2 || name.split(" ").length <= 2)
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={13}
          className="fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star size={13} className="fill-gray-200 text-gray-200" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={13}
          className="fill-gray-200 text-gray-200"
        />
      ))}
    </div>
  );
}

export default function UniversityCard({ university, isAdmin, onDelete }) {
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const initials = getInitials(university.name);
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";

  const typeStyles =
    university.type === "PUBLIC"
      ? "bg-indigo-600/10 text-indigo-600 border-indigo-200"
      : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <Link
      href={`/universities/${university.id}`}
      className="card-glow group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100/50"
    >
      {/* Image Header */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        {university.image ? (
          <img
            src={university.image}
            alt={university.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 via-indigo-900 to-violet-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

        {/* Admin delete button */}
        {isAdmin && (
          <button
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!deleteConfirming) {
                setDeleteConfirming(true);
                return;
              }
              setIsDeleting(true);
              try {
                const response = await fetchWithAuth(
                  `/api/v1/universities/${university.id}`,
                  { method: "DELETE" },
                );
                if (!response.ok) throw new Error();
                onDelete(university.id);
              } catch {
                setIsDeleting(false);
                setDeleteConfirming(false);
              }
            }}
            disabled={isDeleting}
            className={`absolute top-3 left-3 z-10 flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-all disabled:opacity-60 ${
              deleteConfirming
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border border-white/20 bg-black/40 text-red-300 hover:bg-red-500/80 hover:text-white"
            }`}
          >
            <Trash2 size={12} />
            {isDeleting ? "..." : deleteConfirming ? "Confirmar" : ""}
          </button>
        )}

        {/* Floating Rating Badge */}
        {university.rating != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-white">
              {university.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-3">
            {/* University Initials Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xs font-bold text-white shadow-inner backdrop-blur-md ring-1 ring-white/30">
              {initials.slice(0, 3)}
            </div>

            <div className="min-w-0 flex-1 pb-0.5">
              <h3 className="truncate text-[0.95rem] font-bold leading-tight text-white drop-shadow-sm">
                {university.name}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white/80">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{university.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Review Count */}
          <div className="mb-4">
            {university.reviewCount > 0 ? (
              <span className="text-sm font-semibold text-gray-700">
                {university.reviewCount}{" "}
                {university.reviewCount === 1 ? "avaliação" : "avaliações"}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-400">
                Sem avaliações ainda
              </span>
            )}
          </div>
        </div>

        {/* Tags Footer */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${typeStyles}`}
          >
            {typeLabel}
          </span>
          {university.courses?.slice(0, 2).map((course) => (
            <span
              key={course}
              className="rounded-full border border-transparent bg-gray-100 px-2 py-0.5 text-[0.65rem] font-medium text-gray-500"
            >
              {course}
            </span>
          ))}
          {university.courses?.length > 2 && (
            <span className="rounded-full border border-transparent bg-gray-100 px-2 py-0.5 text-[0.65rem] font-medium text-gray-500">
              +{university.courses.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
