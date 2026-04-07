"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translateError } from "@/lib/errorMessages";
import {
  GraduationCap,
  Mail,
  AtSign,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Shield,
  Star,
  Pencil,
  X,
  ShieldX,
  ChevronDown,
  History,
  ArrowRight,
  Users,
} from "lucide-react";
import {
  fetchWithAuth,
  AuthExpiredError,
  clearTokens,
  isAuthenticated as checkAuth,
} from "@/lib/fetchWithAuth";
import StarPicker from "@/components/StarPicker";
import DifficultyPicker from "@/components/DifficultyPicker";

function getInitials(user) {
  if (!user) return "?";
  if (user.username) return user.username.slice(0, 2).toUpperCase();
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "?";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateString) {
  return new Date(dateString)
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function formatMemberSince(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalizedMonth}, ${date.getFullYear()}`;
}

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageState, setPageState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [resendStatus, setResendStatus] = useState(null);

  function handleLogout() {
    router.push("/logout");
  }

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJwtPayload(token);
      if (decoded?.role) setUserRole(decoded.role);
    }

    async function fetchUser() {
      try {
        const response = await fetchWithAuth("/api/v1/users/me");

        if (response.status === 403) {
          setPageState("unverified");
          setIsLoading(false);
          return;
        }

        if (response.status === 404) {
          clearTokens();
          setPageState("not_found");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            translateError(
              data.error?.message,
              "Não foi possível carregar seu perfil.",
            ),
          );
        }

        const data = await response.json();
        setUser(data);
        setPageState("loaded");
      } catch (err) {
        if (err instanceof AuthExpiredError) {
          router.push("/login");
          return;
        }
        setErrorMessage(err.message);
        setPageState("error");
      }
      setIsLoading(false);
    }

    fetchUser();
  }, [router]);

  async function handleResendVerification() {
    if (resendStatus === "sending" || resendStatus === "sent") return;

    setResendStatus("sending");
    try {
      const response = await fetchWithAuth("/api/v1/users/me/email/verify", {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  }

  async function handleDeleteAccount() {
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetchWithAuth("/api/v1/users/me", {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          translateError(data.error?.message, "Erro ao deletar conta."),
        );
      }
      clearTokens();
      router.push("/");
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
      setDeleteConfirming(false);
    }
  }

  // ── Loading ──
  if (isLoading) return <ProfileSkeleton />;

  // ── Account not found ──
  if (pageState === "not_found") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4">
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 backdrop-blur-sm">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2 className="font-headline text-lg font-bold text-white">
              Conta não encontrada
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Essa conta não existe mais. Ela pode ter sido deletada.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-tertiary-fixed-dim px-6 py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110"
          >
            Ir para o início
          </Link>
        </div>
      </main>
    );
  }

  // ── Email not verified ──
  if (pageState === "unverified") {
    const token = localStorage.getItem("token");
    const decoded = decodeJwtPayload(token);
    const email = decoded?.email;

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4">
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/10">
            <Mail size={22} className="text-amber-400" />
          </div>

          <h2 className="font-headline text-lg font-bold text-white">
            Verifique seu email
          </h2>

          {email ? (
            <p className="mt-2 text-sm text-slate-300">
              Enviamos um link de verificação para{" "}
              <span className="font-medium text-white">{email}</span>. Confirme
              seu email para acessar sua conta.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-300">
              Confirme seu email para acessar sua conta.
            </p>
          )}

          <div className="mt-5">
            {resendStatus === "sent" ? (
              <p className="text-sm font-medium text-green-400">
                Email reenviado! Verifique sua caixa de entrada.
              </p>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendStatus === "sending"}
                className="w-full cursor-pointer rounded-xl bg-tertiary-fixed-dim px-4 py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110 disabled:opacity-60"
              >
                {resendStatus === "sending"
                  ? "Enviando..."
                  : "Reenviar email de verificação"}
              </button>
            )}

            {resendStatus === "error" && (
              <p className="mt-2 text-xs text-red-400">
                Falha ao reenviar. Tente novamente.
              </p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 cursor-pointer text-sm text-slate-400 transition-colors hover:text-white"
          >
            Sair da conta
          </button>
        </div>
      </main>
    );
  }

  // ── Generic error ──
  if (pageState === "error") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-slate-300">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-xl bg-tertiary-fixed-dim px-5 py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  // ── Profile ──
  const initials = getInitials(user);
  const isAdmin = userRole === "ADMIN" || user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col bg-background pt-16">
      {/* ── Profile Hero Section ── */}
      <section className="bg-white px-8 pb-12 pt-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-secondary">
                Student Dashboard
              </span>
              <h1 className="font-headline mb-4 text-4xl font-bold text-primary md:text-5xl">
                Bem-vindo, {user.username ?? "Usuário"}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                Sua jornada acadêmica é documentada aqui. Gerencie suas
                contribuições, acompanhe suas sugestões e acesse ferramentas de
                curadoria digital.
              </p>
            </div>
            <div className="md:col-span-4">
              <div className="rounded-xl border-l-4 border-tertiary-fixed-dim bg-surface-container-low p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-outline">
                  Member Since
                </p>
                <p className="font-headline text-xl font-bold text-primary">
                  {formatMemberSince(user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Content ── */}
      <div className="mx-auto w-full max-w-5xl space-y-8 px-8 py-12">
        {/* Verification CTA — only when not verified */}
        {!user.verified && (
          <div className="flex items-start gap-4 rounded-2xl border border-secondary-container bg-secondary-fixed/30 p-6">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1">
              <p className="font-headline text-sm font-bold text-primary">
                Obtenha o selo de verificado
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Vincule seu email universitário para ganhar o selo{" "}
                <span className="font-medium">Verificado</span> e mostrar que
                você realmente estuda ou estudou na universidade que avalia.
              </p>
              <Link
                href="#"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <GraduationCap size={14} />
                Verificar email universitário
              </Link>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {isAdmin && (
          <section className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white shadow-2xl">
            <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-10">
              <Shield size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline mb-6 flex items-center gap-3 text-2xl">
                <Shield size={24} className="text-tertiary-fixed-dim" />
                Painel Admin
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Link
                  href="/admin/university-submissions"
                  className="rounded-xl border border-white/10 bg-white/10 p-6 text-left backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <ShieldCheck
                    size={24}
                    className="mb-3 text-tertiary-fixed-dim"
                  />
                  <h3 className="text-lg font-bold">Gerenciar Sugestões</h3>
                  <p className="text-xs text-blue-200">
                    Pendentes para revisão
                  </p>
                </Link>
                <Link
                  href="/admin/universities/new"
                  className="rounded-xl border border-white/10 bg-white/10 p-6 text-left backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <Building2
                    size={24}
                    className="mb-3 text-tertiary-fixed-dim"
                  />
                  <h3 className="text-lg font-bold">Criar Universidade</h3>
                  <p className="text-xs text-blue-200">
                    Inserir nova instituição no mapa
                  </p>
                </Link>
                <Link
                  href="/admin"
                  className="rounded-xl border border-white/10 bg-white/10 p-6 text-left backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <Users size={24} className="mb-3 text-tertiary-fixed-dim" />
                  <h3 className="text-lg font-bold">Usuários Registrados</h3>
                  <p className="text-xs text-blue-200">
                    Visualizar métricas da comunidade
                  </p>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Reviews + Suggestions side by side */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <MyReviewsSection />
          <UniversitySubmissionsSection />
        </div>

        {/* Account Information */}
        <section className="rounded-2xl bg-white p-8 md:p-12">
          <div className="border-t border-surface-container pt-8 md:pt-12">
            <h2 className="font-headline mb-8 text-2xl text-primary">
              Informações da Conta
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="space-y-6">
                {user.username && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-outline">
                      Nome de Usuário
                    </label>
                    <p className="text-lg font-medium text-primary">
                      @{user.username}
                    </p>
                  </div>
                )}
                {user.email && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-outline">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-primary">
                        {user.email}
                      </p>
                      {user.authProvider && user.authProvider !== "local" && (
                        <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-xs font-medium text-on-secondary-container">
                          Google
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {user.universityEmail && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-outline">
                      Email Universitário
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-primary">
                        {user.universityEmail}
                      </p>
                      {user.verified ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                          <ShieldCheck size={11} />
                          Verificado
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-outline">
                    Membro Desde
                  </label>
                  <p className="text-lg font-medium text-primary">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary px-6 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
              >
                <LogOut size={15} />
                Sair da conta
              </button>
              <div className="flex items-center gap-2">
                {deleteConfirming && (
                  <button
                    onClick={() => setDeleteConfirming(false)}
                    className="cursor-pointer px-3 py-2 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-6 py-2 text-sm font-bold transition-all disabled:opacity-60 ${
                    deleteConfirming
                      ? "bg-error text-white hover:bg-red-600"
                      : "text-error hover:bg-error-container/20"
                  }`}
                >
                  <Trash2 size={14} />
                  {isDeleting
                    ? "Deletando..."
                    : deleteConfirming
                      ? "Confirmar exclusão"
                      : "Desativar Conta"}
                </button>
              </div>
            </div>

            {deleteError && (
              <p className="mt-3 text-xs text-error">{deleteError}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Submission Status Badge ────────────────────────────────────────────────

function SubmissionStatusBadge({ status }) {
  const config = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700",
    },
    APPROVED: {
      label: "Approved",
      className: "bg-green-100 text-green-700",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-100 text-red-700",
    },
  };
  const { label, className } = config[status] || config.PENDING;

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${className}`}
    >
      {label}
    </span>
  );
}

// ─── University Submissions Section ─────────────────────────────────────────

function UniversitySubmissionsSection() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetchWithAuth(
          "/api/v1/users/me/university-submissions",
        );
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.data ?? []);
        }
      } catch {
        // non-blocking
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-headline text-2xl text-primary">Sugestões</h2>
        <Link
          href="/sugerir-universidade"
          className="rounded-lg bg-secondary px-4 py-2 text-xs font-bold uppercase text-on-secondary transition-all hover:opacity-90"
        >
          Sugerir nova
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-outline-variant/20 bg-surface p-4"
            >
              <div className="skeleton h-12 w-12 rounded-lg" />
              <div className="flex-1">
                <div className="skeleton mb-2 h-4 w-40 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-on-surface-variant">
            Você ainda não sugeriu nenhuma universidade.
          </p>
          <Link
            href="/sugerir-universidade"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            <Lightbulb size={12} />
            Sugerir universidade
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center gap-4 rounded-xl border border-outline-variant/20 bg-surface p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold">
                  {submission.name}
                </h4>
                <p className="text-xs text-outline">
                  Enviado em {formatDateShort(submission.createdAt)}
                </p>
                {submission.status === "REJECTED" && submission.reason && (
                  <p className="mt-1 text-xs text-error">
                    Motivo: {submission.reason}
                  </p>
                )}
              </div>
              <SubmissionStatusBadge status={submission.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Star Rating (display only) ────────────────────────────────────────────

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

// ─── Moderation Status Badge ────────────────────────────────────────────────

function ModerationStatusBadge({ status }) {
  const config = {
    APPROVED: {
      label: "Publicada",
      icon: CheckCircle,
      className: "bg-green-50 text-green-700 border-green-200",
    },
    PENDING_MODERATION: {
      label: "Em análise",
      icon: Clock,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    REJECTED_OFFENSIVE: {
      label: "Rejeitada",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
    REJECTED_NONSENSE: {
      label: "Rejeitada",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
    REJECTED_OTHER: {
      label: "Rejeitada",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const {
    label,
    icon: Icon,
    className,
  } = config[status] || config.PENDING_MODERATION;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

// ─── Parse Comment ──────────────────────────────────────────────────────────

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
    // not JSON
  }
  return { structured: false, text: raw };
}

// ─── My Review Card ─────────────────────────────────────────────────────────

function MyReviewCard({ review, onUpdate, onRemove }) {
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
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const childReviews = review.childReviews || [];
  const parsedComment = parseComment(review.comment);
  const TRUNCATE_LENGTH = 120;

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
        onUpdate(review.id, data.review);
        return;
      }

      if (data.moderation) {
        setEditRejectionReason(data.moderation.reason);
        onUpdate(review.id, data.review);
        return;
      }

      setIsEditing(false);
      onUpdate(review.id, data.review);
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
      onRemove(review.id);
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

  // ── Edit mode ──
  if (isEditing) {
    return (
      <li className="rounded-xl border-2 border-secondary-container bg-white p-4">
        {/* Rejection modal */}
        {editRejectionReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-outline-variant/20 bg-white p-8 text-center shadow-2xl">
              <button
                onClick={() => setEditRejectionReason(null)}
                className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface"
              >
                <X size={18} />
              </button>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
                <ShieldX size={32} className="text-error" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Edição não publicada
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {editRejectionReason}
                </p>
              </div>
              <button
                onClick={() => setEditRejectionReason(null)}
                className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Entendi, vou revisar
              </button>
            </div>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil size={13} className="text-secondary" />
            <span className="text-sm font-semibold text-on-surface">
              Editando avaliação
            </span>
          </div>
          <button
            onClick={cancelEditing}
            className="cursor-pointer rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface"
          >
            <X size={15} />
          </button>
        </div>

        {editError && (
          <div className="mb-3 rounded-lg border border-error-container bg-error-container/30 p-2.5">
            <p className="text-xs text-error">{editError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant">
              Nota geral
            </label>
            <div className="flex justify-center rounded-xl border border-outline-variant/20 bg-surface py-3">
              <StarPicker
                value={editRating}
                onChange={setEditRating}
                size="sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant">
              Dificuldade
            </label>
            <DifficultyPicker
              value={editDifficultyLevel}
              onChange={setEditDifficultyLevel}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                O que você mais gosta?
              </span>
              <span className="ml-auto text-xs text-on-surface-variant">
                {editPros.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={editPros}
              onChange={(event) => setEditPros(event.target.value)}
              placeholder="Pontos positivos, destaques do campus ou do curso..."
              className="w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                O que você menos gosta?
              </span>
              <span className="ml-auto text-xs text-on-surface-variant">
                {editCons.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={editCons}
              onChange={(event) => setEditCons(event.target.value)}
              placeholder="Críticas construtivas, pontos de melhoria, dificuldades..."
              className="w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-lg border border-outline-variant/30 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </li>
    );
  }

  // ── Display mode ──
  return (
    <li className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 transition-all hover:shadow-md">
      {/* Header: university name + date + status */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/universities/${review.universityId}`}
            className="font-headline text-lg font-bold text-primary transition-colors hover:text-secondary"
          >
            {review.university?.name || "Universidade"}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-xs font-medium text-on-surface">
              {review.rating.toFixed(1)}
            </span>
            <span className="text-outline-variant">·</span>
            <span className="text-xs text-on-surface-variant">
              dif. {review.difficultyLevel}/5
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded bg-surface-container-high px-2 py-1 text-[10px] uppercase tracking-tighter text-outline">
            {formatDateShort(review.createdAt)}
          </span>
          <ModerationStatusBadge status={review.moderationStatus} />
        </div>
      </div>

      {/* Comment in editorial card style */}
      {parsedComment && (
        <div className="mb-4 space-y-4">
          {parsedComment.structured ? (
            <>
              {parsedComment.pros && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    O que você mais gosta?
                  </label>
                  <div className="rounded-xl bg-surface-container-low px-4 py-3">
                    <p className="text-sm leading-relaxed text-on-surface">
                      {expanded || parsedComment.pros.length <= TRUNCATE_LENGTH
                        ? parsedComment.pros
                        : parsedComment.pros.slice(0, TRUNCATE_LENGTH) + "..."}
                    </p>
                  </div>
                </div>
              )}
              {parsedComment.cons && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    O que você menos gosta?
                  </label>
                  <div className="rounded-xl bg-surface-container-low px-4 py-3">
                    <p className="text-sm leading-relaxed text-on-surface">
                      {expanded || parsedComment.cons.length <= TRUNCATE_LENGTH
                        ? parsedComment.cons
                        : parsedComment.cons.slice(0, TRUNCATE_LENGTH) + "..."}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Comentário
              </label>
              <div className="rounded-xl bg-surface-container-low px-4 py-3">
                <p className="text-sm leading-relaxed text-on-surface">
                  {expanded || parsedComment.text.length <= TRUNCATE_LENGTH
                    ? parsedComment.text
                    : parsedComment.text.slice(0, TRUNCATE_LENGTH) + "..."}
                </p>
              </div>
            </div>
          )}

          {needsExpand && (
            <button
              onClick={() => setExpanded(true)}
              className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-secondary hover:opacity-80"
            >
              Ler mais <ChevronDown size={11} />
            </button>
          )}
        </div>
      )}

      {/* Edit history */}
      {childReviews.length > 0 && (
        <div className="mb-3 border-t border-outline-variant/10 pt-2.5">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:text-secondary"
          >
            <History size={12} />
            Histórico de edições ({childReviews.length})
            <ChevronDown
              size={11}
              className={`transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>
          {showHistory && (
            <ul className="mt-2 space-y-2">
              {childReviews.map((child) => {
                const childComment = parseComment(child.comment);
                const preview = childComment?.structured
                  ? [childComment.pros, childComment.cons]
                      .filter(Boolean)
                      .join(" / ")
                  : childComment?.text || "";
                return (
                  <li
                    key={child.id}
                    className="rounded-lg border border-outline-variant/10 bg-surface px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[0.65rem] text-on-surface-variant">
                        {formatDate(child.createdAt)}
                      </span>
                      <ModerationStatusBadge status={child.moderationStatus} />
                    </div>
                    {preview && (
                      <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                        {preview.length > 100
                          ? preview.slice(0, 100) + "..."
                          : preview}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-outline-variant/10 pt-3">
        <button
          onClick={startEditing}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-secondary"
        >
          <Pencil size={12} />
          Editar
        </button>
        {deleteConfirming && (
          <button
            onClick={() => setDeleteConfirming(false)}
            className="cursor-pointer text-xs text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
            deleteConfirming
              ? "bg-error text-white hover:bg-red-600"
              : "text-error hover:bg-error-container/20"
          }`}
        >
          <Trash2 size={12} />
          {isDeleting
            ? "Removendo..."
            : deleteConfirming
              ? "Confirmar"
              : "Excluir"}
        </button>
      </div>
    </li>
  );
}

// ─── My Reviews Section ─────────────────────────────────────────────────────

function MyReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyReviews() {
      try {
        const response = await fetchWithAuth(
          "/api/v1/users/me/reviews?limit=50",
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data.data ?? []);
        }
      } catch {
        // non-blocking
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyReviews();
  }, []);

  function handleReviewUpdate(reviewId, updatedReview) {
    setReviews((prev) =>
      prev.map((review) => {
        if (review.id !== reviewId) return review;
        const existingChildren = review.childReviews || [];
        return {
          ...review,
          rating:
            updatedReview.moderationStatus === "APPROVED"
              ? updatedReview.rating
              : review.rating,
          difficultyLevel:
            updatedReview.moderationStatus === "APPROVED"
              ? updatedReview.difficultyLevel
              : review.difficultyLevel,
          comment:
            updatedReview.moderationStatus === "APPROVED"
              ? updatedReview.comment
              : review.comment,
          childReviews: [updatedReview, ...existingChildren],
        };
      }),
    );
  }

  function handleReviewRemove(reviewId) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  }

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-headline text-2xl text-primary">
          Minhas Avaliações
        </h2>
        <Link
          href="/avaliar"
          className="flex items-center gap-2 text-sm font-bold text-secondary transition-colors hover:underline"
        >
          Ver todas <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-on-surface-variant">
            Você ainda não fez nenhuma avaliação.
          </p>
          <Link
            href="/avaliar"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Avaliar uma universidade
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <MyReviewCard
              key={review.id}
              review={review}
              onUpdate={handleReviewUpdate}
              onRemove={handleReviewRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Profile Skeleton ───────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background pt-16">
      <section className="bg-white px-8 pb-12 pt-12">
        <div className="mx-auto max-w-5xl">
          <div className="skeleton mb-2 h-4 w-32 rounded" />
          <div className="skeleton mb-4 h-12 w-96 rounded" />
          <div className="skeleton h-6 w-80 rounded" />
        </div>
      </section>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-8 py-12">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
