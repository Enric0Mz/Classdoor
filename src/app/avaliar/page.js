"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { translateError } from "@/lib/errorMessages";
import {
  Search,
  ChevronDown,
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

// ─── University selector ─────────────────────────────────────────────────────

function UniversitySelector({ value, onChange, onSelectName, initialName }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState(initialName || "");

  const { results: filtered, isLoading } = useUniversitySearch({
    search,
    debounceMs: 300,
  });

  // Sync when initialName arrives from API
  useEffect(() => {
    if (initialName) setSelectedName(initialName);
  }, [initialName]);

  function select(university) {
    onChange(university.id);
    onSelectName(university.name);
    setSelectedName(university.name);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-none bg-surface-container p-4 text-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
      >
        {selectedName ? (
          <span className="font-medium text-on-surface">{selectedName}</span>
        ) : (
          <span className="text-on-surface-variant/60">
            Selecione uma universidade...
          </span>
        )}
        <ChevronDown
          size={15}
          className={`shrink-0 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-outline-variant/15 px-3 py-2.5">
            <Search size={14} className="shrink-0 text-on-surface-variant" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar universidade..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-on-surface-variant/50"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {isLoading ? (
              <li className="px-4 py-3 text-sm text-on-surface-variant">
                Buscando...
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-on-surface-variant">
                Nenhuma universidade encontrada.
              </li>
            ) : (
              filtered.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => select(u)}
                    className={`w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary-container/15 hover:text-secondary ${
                      u.id === value
                        ? "bg-secondary-container/15 font-semibold text-secondary"
                        : "text-on-surface"
                    }`}
                  >
                    <span className="block font-medium">{u.name}</span>
                    <span className="text-xs text-on-surface-variant">
                      {u.location}
                    </span>
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

// ─── Moderation loading overlay ──────────────────────────────────────────────

function ModerationOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-secondary-container border-t-secondary" />
          <ShieldCheck size={28} className="text-secondary" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-semibold text-primary">
            Analisando sua avaliação
          </h3>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Nossa moderação está verificando o conteúdo da sua avaliação. Isso
            leva apenas alguns segundos.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-secondary"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-secondary"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-secondary"
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
      <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-white p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <X size={18} />
        </button>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-semibold text-primary">
            Avaliação não publicada
          </h3>
          <p className="mt-2 text-sm text-on-surface-variant">{reason}</p>
        </div>
        <p className="text-xs text-outline">
          Você pode editar sua avaliação e tentar novamente.
        </p>
        <button
          onClick={onClose}
          className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
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
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed-dim/20">
          <ShieldCheck size={32} className="text-tertiary-fixed-dim" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-semibold text-primary">
            Avaliação em análise
          </h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sua avaliação foi recebida e será publicada em breve após a
            verificação dos nossos moderadores.
          </p>
        </div>
        <button
          onClick={() => router.push(`/universities/${universityId}`)}
          className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
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
      <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <ShieldCheck size={32} className="text-green-500" />
        </div>
        <div>
          <h3 className="font-headline text-lg font-semibold text-primary">
            Avaliação publicada!
          </h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sua avaliação foi aprovada pela moderação e já está visível para
            outros estudantes.
          </p>
        </div>
        <button
          onClick={() => router.push(`/universities/${universityId}`)}
          className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Ver minha avaliação
        </button>
      </div>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

function AvaliarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUniversityId = searchParams.get("universityId");

  const [universityId, setUniversityId] = useState(
    preselectedUniversityId || "",
  );
  const [universityName, setUniversityName] = useState("");
  const [rating, setRating] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [showPendingModeration, setShowPendingModeration] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/register");
      return;
    }
    setIsAuthed(true);
  }, [router]);

  // Fetch university name when preselected via query param
  useEffect(() => {
    if (!preselectedUniversityId) return;
    fetch(`/api/v1/universities/${preselectedUniversityId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.name) setUniversityName(data.name);
      })
      .catch(() => {});
  }, [preselectedUniversityId]);

  function validate() {
    if (!universityId) return "Selecione uma universidade.";
    if (!rating) return "Escolha uma nota de 1 a 5.";
    if (!difficultyLevel) return "Escolha o nível de dificuldade.";
    if (!acceptedTerms)
      return "Você precisa aceitar os Termos de Uso para publicar.";
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

      {/* Task-focused header */}
      <header className="fixed top-0 z-50 w-full bg-white/70 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-headline text-2xl font-bold tracking-tight text-primary"
          >
            InfoCampus
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-on-surface-variant md:block">
              Processo de Avaliação
            </span>
            <Link
              href={
                universityId
                  ? `/universities/${universityId}`
                  : "/universities"
              }
              className="group rounded-lg p-2 transition-colors hover:bg-surface-container"
            >
              <X size={20} className="text-on-surface-variant" />
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-surface px-4 pb-20 pt-24">
        <div className="mx-auto max-w-3xl">
          {/* Hero heading */}
          <div className="mb-12 md:pr-24">
            <h1 className="mb-4 font-headline text-4xl font-bold leading-tight text-primary md:text-5xl">
              Ajude outros estudantes: Avalie a{" "}
              {universityName ? (
                <span className="text-secondary">{universityName}</span>
              ) : (
                <span className="text-secondary">sua universidade</span>
              )}
            </h1>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Sua experiência é valiosa. Compartilhe sua visão real sobre o
              campus, o ensino e a carreira para orientar futuros
              universitários.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-8 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Identificação */}
            <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.04)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-sm font-bold text-on-secondary-fixed">
                  1
                </div>
                <h2 className="font-headline text-xl font-bold text-primary">
                  Identificação
                </h2>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Universidade
                </label>
                <UniversitySelector
                  value={universityId}
                  onChange={setUniversityId}
                  onSelectName={setUniversityName}
                  initialName={universityName}
                />
              </div>
            </section>

            {/* Section 2: Notas Rápidas */}
            <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.04)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-sm font-bold text-on-secondary-fixed">
                  2
                </div>
                <h2 className="font-headline text-xl font-bold text-primary">
                  Notas Rápidas
                </h2>
              </div>

              <div className="space-y-6">
                {/* Overall rating */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface">
                      Nota geral
                    </span>
                    <span className="text-xs italic text-on-surface-variant">
                      Sua impressão geral
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-container py-5">
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-on-surface">
                      Nível de dificuldade
                    </span>
                    <span className="text-xs italic text-on-surface-variant">
                      1 = mais fácil, 5 = mais difícil
                    </span>
                  </div>
                  <DifficultyPicker
                    value={difficultyLevel}
                    onChange={setDifficultyLevel}
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Sua Experiência */}
            <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.04)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-sm font-bold text-on-secondary-fixed">
                  3
                </div>
                <h2 className="font-headline text-xl font-bold text-primary">
                  Sua Experiência
                </h2>
              </div>

              <div className="space-y-6">
                {/* Pros */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    O que você MAIS gosta?
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="Pontos positivos, destaques do campus ou do curso..."
                    className="w-full resize-none rounded-xl border-none bg-surface-container p-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                {/* Cons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    O que você MENOS gosta?
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="Críticas construtivas, pontos de melhoria, dificuldades..."
                    className="w-full resize-none rounded-xl border-none bg-surface-container p-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Submit */}
            <section className="pt-8">
              <div className="mb-8 flex items-start gap-3">
                <div className="relative flex h-5 items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-5 w-5 cursor-pointer rounded-lg border-outline-variant text-primary focus:ring-secondary"
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed text-on-surface-variant"
                >
                  Confirmo que esta avaliação é baseada na minha experiência real
                  como estudante e estou de acordo com os{" "}
                  <Link
                    href="/em-breve"
                    className="font-semibold text-secondary underline decoration-secondary/30"
                  >
                    Termos de Uso
                  </Link>{" "}
                  do InfoCampus.
                </label>
              </div>

              <div className="flex flex-col items-center gap-4 md:flex-row">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-tertiary-fixed-dim px-10 py-4 font-bold text-primary shadow-lg transition-all duration-150 hover:bg-tertiary-fixed active:scale-95 disabled:opacity-60 md:w-auto"
                >
                  {isLoading ? "Enviando..." : "Publicar Avaliação"}
                </button>
                <p className="text-center text-xs text-on-surface-variant md:text-left">
                  Sua avaliação será analisada por nossa equipe de curadoria
                  antes de ser publicada.
                </p>
              </div>
            </section>
          </form>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-primary-container bg-primary py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="font-headline text-lg font-bold text-yellow-500">
            InfoCampus
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            © 2024 InfoCampus. Excelência Acadêmica Curada.
          </p>
          <div className="flex gap-6">
            <Link
              href="/em-breve"
              className="text-[10px] uppercase tracking-widest text-slate-400 transition-colors hover:text-white"
            >
              Privacidade
            </Link>
            <Link
              href="/em-breve"
              className="text-[10px] uppercase tracking-widest text-slate-400 transition-colors hover:text-white"
            >
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function AvaliarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-container border-t-secondary" />
        </div>
      }
    >
      <AvaliarContent />
    </Suspense>
  );
}
