"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { translateError } from "@/lib/errorMessages";
import {
  GraduationCap,
  Search,
  ChevronDown,
  ArrowLeft,
  Star,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import {
  fetchWithAuth,
  AuthExpiredError,
  isAuthenticated as checkAuth,
} from "@/lib/fetchWithAuth";
import StarPicker from "@/components/StarPicker";
import DifficultyPicker from "@/components/DifficultyPicker";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";

// ─── University selector ──────────────────────────────────────────────────────

function UniversitySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const { results: filtered, isLoading } = useUniversitySearch({
    search,
    debounceMs: 300,
  });

  function select(university) {
    onChange(university.id);
    setSelected(university);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors hover:border-sky-300 focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
      >
        {selected ? (
          <span className="font-medium text-gray-800">{selected.name}</span>
        ) : (
          <span className="text-gray-400">Selecione uma universidade...</span>
        )}
        <ChevronDown
          size={15}
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar universidade..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <li className="px-4 py-3 text-sm text-gray-400">Buscando...</li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">
                Nenhuma universidade encontrada.
              </li>
            ) : (
              filtered.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => select(u)}
                    className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-sky-50 hover:text-sky-700 ${
                      u.id === value
                        ? "bg-sky-50 font-semibold text-sky-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="block font-medium">{u.name}</span>
                    <span className="text-xs text-gray-400">{u.location}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Moderation loading overlay ───────────────────────────────────────────────

function ModerationOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white p-8 text-center shadow-2xl">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
          <ShieldCheck size={28} className="text-sky-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Analisando sua avaliação
          </h3>
          <p className="mt-1.5 text-sm text-gray-500">
            Nossa moderação está verificando o conteúdo da sua avaliação. Isso
            leva apenas alguns segundos.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-sky-400"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-sky-400"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-sky-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Rejection modal ─────────────────────────────────────────────────────────

function RejectionModal({ reason, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Avaliação não publicada
          </h3>
          <p className="mt-2 text-sm text-gray-600">{reason}</p>
        </div>
        <p className="text-xs text-gray-400">
          Você pode editar sua avaliação e tentar novamente.
        </p>
        <button
          onClick={onClose}
          className="blue-gradient w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Entendi, vou revisar
        </button>
      </div>
    </div>
  );
}

// ─── Pending moderation modal ────────────────────────────────────────────────

function PendingModerationModal({ universityId }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white p-8 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <ShieldCheck size={32} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Avaliação em análise
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Sua avaliação foi recebida e será publicada em breve após a
            verificação dos nossos moderadores.
          </p>
        </div>
        <button
          onClick={() => router.push(`/universities/${universityId}`)}
          className="blue-gradient w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Voltar para a universidade
        </button>
      </div>
    </div>
  );
}

// ─── Approval modal ──────────────────────────────────────────────────────────

function ApprovalModal({ universityId }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white p-8 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <ShieldCheck size={32} className="text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Avaliação publicada!
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Sua avaliação foi aprovada pela moderação e já está visível para
            outros estudantes.
          </p>
        </div>
        <button
          onClick={() => router.push(`/universities/${universityId}`)}
          className="blue-gradient w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver minha avaliação
        </button>
      </div>
    </div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function AvaliarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUniversityId = searchParams.get("universityId");

  const [universityId, setUniversityId] = useState(
    preselectedUniversityId || "",
  );
  const [rating, setRating] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [showPendingModeration, setShowPendingModeration] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  // Auth guard
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/register");
      return;
    }
    setIsAuthed(true);
  }, [router]);

  function validate() {
    if (!universityId) return "Selecione uma universidade.";
    if (!rating) return "Escolha uma nota de 1 a 5.";
    if (!difficultyLevel) return "Escolha o nível de dificuldade.";
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const prosText = pros.trim();
      const consText = cons.trim();
      const comment =
        prosText || consText
          ? JSON.stringify({ pros: prosText, cons: consText })
          : undefined;

      const response = await fetchWithAuth("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityId,
          rating,
          difficultyLevel,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(data.error?.message, "Erro ao enviar avaliação."),
        );
      }

      if (data.moderation?.status === "PENDING_MODERATION") {
        setShowPendingModeration(true);
        return;
      }

      if (data.moderation) {
        setRejectionReason(data.moderation.reason);
        return;
      }

      setShowApproval(true);
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        router.push("/login");
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthed) return null;

  return (
    <>
      {isLoading && <ModerationOverlay />}
      {showPendingModeration && (
        <PendingModerationModal universityId={universityId} />
      )}
      {showApproval && <ApprovalModal universityId={universityId} />}
      {rejectionReason && (
        <RejectionModal
          reason={rejectionReason}
          onClose={() => setRejectionReason(null)}
        />
      )}
      <main
        className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-12"
        style={{ backgroundColor: "#0F2854" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial purple glow */}
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="blue-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-sky-500/30">
                <GraduationCap size={22} />
              </div>
              <span className="blue-gradient-text text-[1.4rem] font-extrabold tracking-tight">
                InfoCampus
              </span>
            </Link>

            <div className="stagger-1 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Star size={13} />
              <span>Avaliações verificadas por estudantes</span>
            </div>

            <div>
              <h1 className="stagger-2 text-2xl font-semibold tracking-tight text-white">
                Avaliar universidade
              </h1>
              <p className="stagger-3 mt-1.5 text-sm text-gray-400">
                Sua avaliação ajuda outros estudantes a escolherem melhor
              </p>
            </div>
          </div>

          {/* Card wrapper — purple glow radiates from behind the card */}
          <div className="relative">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(28,77,141,0.45) 0%, rgba(73,136,196,0.2) 40%, transparent 70%)",
                transform: "scale(1.6)",
                filter: "blur(24px)",
              }}
            />

            {/* Form card */}
            <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-xl shadow-black/30">
              {error && (
                <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
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
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                {/* University */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Universidade
                  </label>
                  <UniversitySelector
                    value={universityId}
                    onChange={setUniversityId}
                  />
                </div>

                {/* Rating */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Nota geral
                  </label>
                  <div className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 py-5">
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      Nível de dificuldade
                    </label>
                    <span className="text-xs text-gray-400">
                      1 = mais fácil, 5 = mais difícil
                    </span>
                  </div>
                  <DifficultyPicker
                    value={difficultyLevel}
                    onChange={setDifficultyLevel}
                  />
                </div>

                {/* Comment — Prós & Contras */}
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-semibold text-gray-700">
                    Comentário{" "}
                    <span className="font-normal text-gray-400">
                      (opcional)
                    </span>
                  </label>

                  {/* Prós */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span>✅</span>
                      <span className="text-sm font-semibold text-green-700">
                        Prós
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {pros.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={pros}
                      onChange={(e) => setPros(e.target.value)}
                      placeholder="Pontos positivos: infraestrutura, professores, oportunidades..."
                      className="w-full resize-none rounded-xl border border-green-200 bg-green-50/50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-green-300 focus:bg-white focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Contras */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span className="text-sm font-semibold text-amber-700">
                        Contras
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        {cons.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={cons}
                      onChange={(e) => setCons(e.target.value)}
                      placeholder="Pontos negativos: burocracia, infraestrutura, dificuldades..."
                      className="w-full resize-none rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="blue-gradient flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isLoading ? (
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
                      Enviando...
                    </>
                  ) : (
                    <>🎓 Publicar avaliação</>
                  )}
                </button>
              </form>
            </div>
          </div>
          {/* end card wrapper */}

          {/* Back link */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              <ArrowLeft size={14} />
              Voltar para universidades
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default function AvaliarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        </div>
      }
    >
      <AvaliarContent />
    </Suspense>
  );
}
