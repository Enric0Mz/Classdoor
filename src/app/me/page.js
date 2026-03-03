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
} from "lucide-react";

function getInitials(user) {
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
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchUser() {
      try {
        const response = await fetch("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("auth-change"));
          router.push("/login");
          return;
        }

        // Email not verified — show a specific screen with resend option
        if (response.status === 403) {
          setPageState("unverified");
          setIsLoading(false);
          return;
        }

        // User deleted — token still valid but account is gone
        if (response.status === 404) {
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("auth-change"));
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
        setErrorMessage(err.message);
        setPageState("error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleResendVerification() {
    if (resendStatus === "sending" || resendStatus === "sent") return;

    const token = localStorage.getItem("token");
    setResendStatus("sending");
    try {
      const response = await fetch("/api/v1/users/me/email/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
    const token = localStorage.getItem("token");
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch("/api/v1/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || "Erro ao deletar conta.");
      }
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-change"));
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
        style={{ backgroundColor: "#0f0f14" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

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
            className="brand-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
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
        style={{ backgroundColor: "#0f0f14" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

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
                className="brand-gradient w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
        style={{ backgroundColor: "#0f0f14" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-400">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
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
        style={{ backgroundColor: "#0f0f14" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial purple glow */}
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          {/* Avatar */}
          <div className="brand-gradient stagger-1 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg">
            {initials}
          </div>

          {/* Name + verified badge */}
          <div className="mt-4 flex items-center gap-2">
            <h1 className="stagger-2 text-2xl font-semibold tracking-tight text-white">
              {user.username ?? "Usuário anônimo"}
            </h1>
            {user.verified && (
              <span className="flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
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
            <div className="flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-900">
                  Obtenha o selo de verificado
                </p>
                <p className="mt-1 text-sm text-indigo-700">
                  Vincule seu email universitário para ganhar o selo{" "}
                  <span className="font-medium">Verificado</span> e mostrar que
                  você realmente estuda ou estudou na universidade que avalia.
                </p>
                <Link
                  href="#"
                  className="brand-gradient mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <GraduationCap size={14} />
                  Verificar email universitário
                </Link>
              </div>
            </div>
          )}

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

function ProfileSkeleton() {
  return (
    <main className="bg-gray-50">
      <section
        className="relative overflow-hidden pb-20 pt-12"
        style={{ backgroundColor: "#0f0f14" }}
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
