"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Settings,
  Building2,
  Shield,
  Star,
  Pencil,
  X,
  ShieldX,
  ChevronDown,
  History,
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

// Decodes the JWT payload on the client side (no verification needed here —
// the server already rejected the request, we just want to show the email).
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

  // "loading" | "loaded" | "error" | "unverified" | "not_found"
  const [pageState, setPageState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);

  const [userRole, setUserRole] = useState(null);

  // Delete account flow
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Resend verification email
  // null | "sending" | "sent" | "error"
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

        // Email not verified — show a specific screen with resend option
        if (response.status === 403) {
          setPageState("unverified");
          setIsLoading(false);
          return;
        }

        // User deleted — token still valid but account is gone
        if (response.status === 404) {
          clearTokens();
          setPageState("not_found");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error?.message || "Não foi possível carregar seu perfil.",
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
    // First click: ask for confirmation
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }

    // Second click: execute deletion
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetchWithAuth("/api/v1/users/me", {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || "Erro ao deletar conta.");
      }
      clearTokens();
      router.push("/");
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
      setDeleteConfirming(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) return <ProfileSkeleton />;

  // ── Account not found (deleted while token still valid) ───────────────────

  if (pageState === "not_found") {
    return (
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-gray-400">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Conta não encontrada
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Essa conta não existe mais. Ela pode ter sido deletada.
            </p>
          </div>
          <Link
            href="/"
            className="blue-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Ir para o início
          </Link>
        </div>
      </main>
    );
  }

  // ── Email not verified ────────────────────────────────────────────────────

  if (pageState === "unverified") {
    const token = localStorage.getItem("token");
    const decoded = decodeJwtPayload(token);
    const email = decoded?.email;

    return (
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-400/20">
            <Mail size={22} className="text-amber-400" />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Verifique seu email
          </h2>

          {email ? (
            <p className="mt-2 text-sm text-gray-400">
              Enviamos um link de verificação para{" "}
              <span className="font-medium text-gray-200">{email}</span>.
              Confirme seu email para acessar sua conta.
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-400">
              Confirme seu email para acessar sua conta.
            </p>
          )}

          <div className="mt-5">
            {resendStatus === "sent" ? (
              <p className="text-sm font-medium text-green-400">
                ✅ Email reenviado! Verifique sua caixa de entrada.
              </p>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendStatus === "sending"}
                className="blue-gradient w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
            className="mt-4 text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            Sair da conta
          </button>
        </div>
      </main>
    );
  }

  // ── Generic error ─────────────────────────────────────────────────────────

  if (pageState === "error") {
    return (
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-400">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="blue-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  const initials = getInitials(user);

  return (
    <main className="bg-gray-50">
      {/* Dark hero band */}
      <section
        className="relative overflow-hidden pb-20 pt-12"
        style={{ backgroundColor: "#0F2854" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial purple glow */}
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          {/* Avatar */}
          <div className="blue-gradient stagger-1 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg">
            {initials}
          </div>

          {/* Name + verified badge */}
          <div className="mt-4 flex items-center gap-2">
            <h1 className="stagger-2 text-2xl font-semibold tracking-tight text-white">
              {user.username ?? "Usuário anônimo"}
            </h1>
            {user.verified && (
              <span className="flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                <ShieldCheck size={12} />
                Verificado
              </span>
            )}
          </div>

          <p className="stagger-3 mt-1.5 flex items-center gap-1.5 text-sm text-gray-400">
            <Calendar size={13} />
            Membro desde {formatDate(user.createdAt)}
          </p>
        </div>

        {/* Bottom gradient fade into gray-50 content */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Content cards */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex flex-col gap-4">
          {/* Info card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Informações da conta
            </h2>
            <ul className="flex flex-col divide-y divide-gray-50">
              {user.username && (
                <InfoRow
                  icon={<AtSign size={15} />}
                  label="Nome de usuário"
                  value={`@${user.username}`}
                />
              )}
              {user.email && (
                <InfoRow
                  icon={<Mail size={15} />}
                  label="Email"
                  value={user.email}
                  badge={
                    user.authProvider && user.authProvider !== "local" ? (
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                        <svg className="h-3 w-3" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </span>
                    ) : null
                  }
                />
              )}
              {user.universityEmail && (
                <InfoRow
                  icon={<GraduationCap size={15} />}
                  label="Email universitário"
                  value={user.universityEmail}
                  badge={
                    user.verified ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                        <ShieldCheck size={11} />
                        Verificado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600">
                        Pendente
                      </span>
                    )
                  }
                />
              )}
              <InfoRow
                icon={<Calendar size={15} />}
                label="Membro desde"
                value={formatDate(user.createdAt)}
              />
            </ul>
          </div>

          {/* Verification CTA — only when not verified */}
          {!user.verified && (
            <div className="flex items-start gap-4 rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-sky-900">
                  Obtenha o selo de verificado
                </p>
                <p className="mt-1 text-sm text-sky-700">
                  Vincule seu email universitário para ganhar o selo{" "}
                  <span className="font-medium">Verificado</span> e mostrar que
                  você realmente estuda ou estudou na universidade que avalia.
                </p>
                <Link
                  href="#"
                  className="blue-gradient mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <GraduationCap size={14} />
                  Verificar email universitário
                </Link>
              </div>
            </div>
          )}

          {/* Admin Panel — only visible to admins */}
          {(userRole === "ADMIN" || user.role === "ADMIN") && (
            <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <Shield size={16} />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-600">
                  Painel Admin
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Gerencie o conteudo da plataforma.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/universities/new"
                  className="blue-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Building2 size={15} />
                  Criar universidade
                </Link>
                <Link
                  href="/admin/university-submissions"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
                >
                  <Settings size={15} />
                  Gerenciar sugestoes
                </Link>
              </div>
            </div>
          )}

          {/* My Reviews */}
          <MyReviewsSection />

          {/* University Submissions */}
          <UniversitySubmissionsSection />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
          >
            <LogOut size={15} />
            Sair da conta
          </button>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-100 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-red-400">
              Zona de perigo
            </h2>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Deletar conta
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {deleteConfirming
                    ? "Tem certeza? Essa ação é permanente e não pode ser desfeita."
                    : "Esta ação é permanente e não pode ser desfeita."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {deleteConfirming && (
                  <button
                    onClick={() => setDeleteConfirming(false)}
                    className="text-xs text-gray-400 transition-colors hover:text-gray-600"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 ${
                    deleteConfirming
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "border border-red-200 text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Trash2 size={14} />
                  {isDeleting
                    ? "Deletando..."
                    : deleteConfirming
                      ? "Confirmar exclusão"
                      : "Deletar conta"}
                </button>
              </div>
            </div>

            {deleteError && (
              <p className="mt-3 text-xs text-red-500">{deleteError}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value, badge }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3 text-gray-400">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{value}</span>
        {badge}
      </div>
    </li>
  );
}

function SubmissionStatusBadge({ status }) {
  const config = {
    PENDING: {
      label: "Pendente",
      icon: Clock,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    APPROVED: {
      label: "Aprovada",
      icon: CheckCircle,
      className: "bg-green-50 text-green-700 border-green-200",
    },
    REJECTED: {
      label: "Rejeitada",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const { label, icon: Icon, className } = config[status] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Minhas sugestoes de universidade
        </h2>
        <Link
          href="/sugerir-universidade"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 transition-colors hover:text-sky-700"
        >
          <Lightbulb size={12} />
          Sugerir universidade
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-4 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-gray-400">
          Voce ainda nao sugeriu nenhuma universidade.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-50">
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {submission.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(submission.createdAt)}
                </p>
                {submission.status === "REJECTED" && submission.reason && (
                  <p className="mt-1 text-xs text-red-500">
                    Motivo: {submission.reason}
                  </p>
                )}
              </div>
              <SubmissionStatusBadge status={submission.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Star Rating (display only) ──────────────────────────────────────────────

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

// ─── My Review Card ──────────────────────────────────────────────────────────

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
        throw new Error(data.error?.message || "Erro ao atualizar avaliação.");
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
      <li className="rounded-xl border-2 border-sky-200 bg-white p-4">
        {/* Rejection modal */}
        {editRejectionReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative mx-4 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white p-8 text-center shadow-2xl">
              <button
                onClick={() => setEditRejectionReason(null)}
                className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <ShieldX size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Edição não publicada
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {editRejectionReason}
                </p>
              </div>
              <button
                onClick={() => setEditRejectionReason(null)}
                className="blue-gradient w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Entendi, vou revisar
              </button>
            </div>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil size={13} className="text-sky-500" />
            <span className="text-sm font-semibold text-gray-700">
              Editando avaliação
            </span>
          </div>
          <button
            onClick={cancelEditing}
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={15} />
          </button>
        </div>

        {editError && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 p-2.5">
            <p className="text-xs text-red-600">{editError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">
              Nota geral
            </label>
            <div className="flex justify-center rounded-xl border border-gray-100 bg-gray-50 py-3">
              <StarPicker
                value={editRating}
                onChange={setEditRating}
                size="sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">
              Dificuldade
            </label>
            <DifficultyPicker
              value={editDifficultyLevel}
              onChange={setEditDifficultyLevel}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">✅</span>
              <span className="text-xs font-semibold text-green-700">Prós</span>
              <span className="ml-auto text-xs text-gray-400">
                {editPros.length}/500
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={500}
              value={editPros}
              onChange={(event) => setEditPros(event.target.value)}
              placeholder="Pontos positivos..."
              className="w-full resize-none rounded-lg border border-green-200 bg-green-50/50 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-green-300 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">⚠️</span>
              <span className="text-xs font-semibold text-amber-700">
                Contras
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {editCons.length}/500
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={500}
              value={editCons}
              onChange={(event) => setEditCons(event.target.value)}
              placeholder="Pontos negativos..."
              className="w-full resize-none rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="blue-gradient flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
    <li className="rounded-xl border border-gray-100 bg-white p-4 transition-all hover:shadow-sm">
      {/* Header: university name + rating + moderation status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/universities/${review.universityId}`}
            className="text-sm font-semibold text-gray-800 hover:text-sky-600 transition-colors"
          >
            {review.university?.name || "Universidade"}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={13} />
            <span className="text-xs font-medium text-gray-600">
              {review.rating.toFixed(1)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-400">
              dif. {review.difficultyLevel}/5
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
        <ModerationStatusBadge status={review.moderationStatus} />
      </div>

      {/* Comment preview */}
      {parsedComment && (
        <div className="mt-3 space-y-2">
          {parsedComment.structured ? (
            <>
              {parsedComment.pros && (
                <div className="rounded-lg border border-green-100 bg-green-50/60 px-3 py-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-green-700">
                    ✅ Prós
                  </span>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-700">
                    {expanded || parsedComment.pros.length <= TRUNCATE_LENGTH
                      ? parsedComment.pros
                      : parsedComment.pros.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
              {parsedComment.cons && (
                <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-amber-700">
                    ⚠️ Contras
                  </span>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-700">
                    {expanded || parsedComment.cons.length <= TRUNCATE_LENGTH
                      ? parsedComment.cons
                      : parsedComment.cons.slice(0, TRUNCATE_LENGTH) + "..."}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs leading-relaxed text-gray-700">
              {expanded || parsedComment.text.length <= TRUNCATE_LENGTH
                ? parsedComment.text
                : parsedComment.text.slice(0, TRUNCATE_LENGTH) + "..."}
            </p>
          )}

          {needsExpand && (
            <button
              onClick={() => setExpanded(true)}
              className="flex cursor-pointer items-center gap-0.5 text-xs font-medium text-sky-500 hover:opacity-80"
            >
              Ler mais <ChevronDown size={11} />
            </button>
          )}
        </div>
      )}

      {/* Edit history */}
      {childReviews.length > 0 && (
        <div className="mt-3 border-t border-gray-50 pt-2.5">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-sky-600"
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
                    className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[0.65rem] text-gray-400">
                        {formatDate(child.createdAt)}
                      </span>
                      <ModerationStatusBadge status={child.moderationStatus} />
                    </div>
                    {preview && (
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
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

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-2.5">
        <button
          onClick={startEditing}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-600"
        >
          <Pencil size={12} />
          Editar
        </button>
        <div className="flex-1" />
        {deleteConfirming && (
          <button
            onClick={() => setDeleteConfirming(false)}
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
            deleteConfirming
              ? "bg-red-500 text-white hover:bg-red-600"
              : "text-red-400 hover:bg-red-50 hover:text-red-500"
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

// ─── My Reviews Section ──────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Minhas avaliações
        </h2>
        <Link
          href="/avaliar"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 transition-colors hover:text-sky-700"
        >
          <Star size={12} />
          Nova avaliação
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">
            Você ainda não fez nenhuma avaliação.
          </p>
          <Link
            href="/avaliar"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
          >
            Avaliar uma universidade
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
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
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="bg-gray-50">
      <section
        className="relative overflow-hidden pb-20 pt-12"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-3 px-6">
          <div className="skeleton h-20 w-20 rounded-full" />
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="skeleton h-4 w-32 rounded-lg" />
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="skeleton mb-4 h-4 w-32 rounded" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
