import Link from "next/link";

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
  const stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <svg key={i} className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <svg key={i} className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#d1d5db" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else {
      stars.push(
        <svg key={i} className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function UniversityCard({ university }) {
  const initials = getInitials(university.name);
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";
  const typeColor =
    university.type === "PUBLIC"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-amber-100 text-amber-700";

  return (
    <Link
      href={`/universities/${university.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image area */}
      <div className="relative h-44 w-full overflow-hidden">
        {university.image ? (
          <img
            src={university.image}
            alt={university.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-400 via-violet-500 to-indigo-700" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Bottom overlay: initials icon + name + location */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xs font-bold text-white shadow backdrop-blur-sm ring-1 ring-white/30">
            {initials.slice(0, 3)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.82rem] font-semibold leading-tight text-white drop-shadow-sm">
              {university.name}
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-[0.72rem] text-white/75">
              <svg className="h-3 w-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="truncate">{university.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4">
        {/* Rating row */}
        {university.rating != null ? (
          <div className="flex items-center gap-2">
            <StarRating rating={university.rating} />
            <span className="text-sm font-semibold text-gray-800">
              {university.rating.toFixed(1)}
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Sem avaliações ainda</p>
        )}

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
            {typeLabel}
          </span>
          {university.courses?.slice(0, 2).map((course) => (
            <span
              key={course}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500"
            >
              {course}
            </span>
          ))}
          {university.courses?.length > 2 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
              +{university.courses.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
