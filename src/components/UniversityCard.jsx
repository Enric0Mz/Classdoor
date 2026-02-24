import Link from "next/link";
import { MapPin, Star } from "lucide-react";

function getInitials(name) {
  return name
    .split(" ")
    .filter((w) => w.length > 2 || name.split(" ").length <= 2)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => (
        <Star key={`full-${i}`} size={14} className="fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalf && (
        <div className="relative">
          <Star size={14} className="text-gray-200 fill-gray-200" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(empty)].map((_, i) => (
        <Star key={`empty-${i}`} size={14} className="fill-gray-200 text-gray-200" />
      ))}
    </div>
  );
}

export default function UniversityCard({ university }) {
  const initials = getInitials(university.name);
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";
  
  // Refined colors for badges
  const typeStyles =
    university.type === "PUBLIC"
      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <Link
      href={`/universities/${university.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100/50"
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
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600" />
        )}

        {/* Improved Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-3">
            {/* University Initials Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xs font-bold text-white shadow-inner backdrop-blur-md ring-1 ring-white/30">
              {initials.slice(0, 3)}
            </div>
            
            <div className="min-w-0 flex-1 pb-0.5">
              <h3 className="truncate text-[0.95rem] font-bold leading-tight text-white drop-shadow-sm">
                {university.name}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-white/80 font-medium">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{university.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between p-4 pt-3.5">
        <div>
          {/* Rating Section */}
          <div className="flex items-center gap-2 mb-3">
            {university.rating != null ? (
              <>
                <span className="text-lg font-bold text-gray-900 leading-none">
                  {university.rating.toFixed(1)}
                </span>
                <StarRating rating={university.rating} />
                <span className="text-xs text-gray-400 font-medium ml-auto">
                  Avaliação média
                </span>
              </>
            ) : (
              <span className="text-xs font-medium text-gray-400">
                Sem avaliações ainda
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gray-50 mb-3" />
        </div>

        {/* Tags Footer */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${typeStyles}`}>
            {typeLabel}
          </span>
          {university.courses?.slice(0, 2).map((course) => (
            <span
              key={course}
              className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-medium text-gray-600"
            >
              {course}
            </span>
          ))}
          {university.courses?.length > 2 && (
            <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[0.65rem] font-medium text-gray-500">
              +{university.courses.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
