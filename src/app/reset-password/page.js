"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { translateError } from "@/lib/errorMessages";

const PASSWORD_RULES = [
  {
    label: "Entre 8 e 40 caracteres",
    test: (p) => p.length >= 8 && p.length <= 40,
  },
  { label: "1 letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "1 letra minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "1 número", test: (p) => /[0-9]/.test(p) },
  { label: "1 símbolo (!@#$…)", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

function PasswordRules({ password }) {
  return (
    <ul className="flex flex-col gap-1.5 pt-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-2">
            <svg
              className={`h-3.5 w-3.5 shrink-0 transition-colors ${met ? "text-green-500" : "text-gray-300"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`text-xs transition-colors ${met ? "text-green-600" : "text-gray-400"}`}
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [error, setError] = useState(
    token ? null : "O link de redefinição está sem o token necessário.",
  );
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((response) => response.json())
      .then((data) => setPlatformStats(data))
      .catch(() => {});
  }, []);

  function validate() {
    if (!PASSWORD_RULES.every((rule) => rule.test(newPassword))) {
      return "A senha não atende a todos os requisitos.";
    }
    if (newPassword !== passwordConfirmation) {
      return "As senhas não coincidem.";
    }
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
      const response = await fetch("/api/v1/users/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(
            data.error?.message,
            "Erro ao redefinir senha. Tente novamente.",
          ),
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="relative hidden overflow-hidden md:flex md:w-[45%] md:items-center md:justify-center md:p-16 lg:w-[40%] lg:p-24"
        style={{
          background: "linear-gradient(135deg, #001337 0%, #0f2854 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="/hero-banner.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute top-1/2 -right-48 h-[600px] w-[600px] rounded-full border border-white/5" />
        </div>

        <div className="relative z-10 max-w-xl text-white">
          <div className="mb-12">
            <Link
              href="/"
              className="font-headline text-2xl font-bold tracking-tight text-tertiary-fixed-dim"
            >
              InfoCampus
            </Link>
          </div>

          <h1 className="font-headline mb-8 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Quase lá! Defina sua nova senha.
          </h1>

          <p className="mb-12 max-w-md text-lg leading-relaxed text-on-primary-container">
            Escolha uma senha segura para proteger sua conta e continue
            avaliando universidades.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4">
            <div className="glass-effect rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-1 font-headline text-3xl font-bold text-tertiary-fixed-dim">
                +{platformStats?.universityCount ?? "..."}
              </div>
              <div className="text-sm uppercase tracking-widest text-on-primary-container">
                Universidades
              </div>
            </div>
            <div className="glass-effect rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-1 font-headline text-3xl font-bold text-tertiary-fixed-dim">
                {platformStats?.averageRating ?? "..."}
              </div>
              <div className="text-sm uppercase tracking-widest text-on-primary-container">
                Nota Média
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white p-8 md:w-[55%] md:p-16 lg:w-[60%] lg:p-24">
        <div className="w-full max-w-md">
          <div className="mb-12 flex justify-center md:hidden">
            <Link
              href="/"
              className="font-headline text-3xl font-bold tracking-tight text-primary"
            >
              InfoCampus
            </Link>
          </div>

          {success ? (
            <>
              <div className="mb-8 flex flex-col items-center text-center">
                <CheckCircle size={48} className="mb-4 text-emerald-500" />
                <h2 className="font-headline mb-3 text-3xl font-bold text-primary">
                  Senha redefinida!
                </h2>
                <p className="mt-3 text-on-surface-variant">
                  Sua senha foi alterada com sucesso. Agora você pode entrar com
                  a nova senha.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-4 block w-full cursor-pointer rounded-xl bg-primary py-4 text-center font-bold text-white shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.12)] transition-all duration-300 hover:bg-primary-container active:scale-95"
              >
                Ir para login
              </Link>
            </>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h2 className="font-headline mb-3 text-3xl font-bold text-primary">
                  Nova senha
                </h2>
                <p className="text-on-surface-variant">
                  Crie uma nova senha para sua conta.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-primary"
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={!token}
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-on-surface outline-none transition-all duration-200 placeholder:text-outline/50 focus:border-secondary focus:ring-4 focus:ring-secondary/5 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-outline hover:text-primary"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <PasswordRules password={newPassword} />
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="passwordConfirmation"
                    className="mb-2 block text-sm font-semibold text-primary"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirmation"
                      type={showPasswordConfirmation ? "text" : "password"}
                      required
                      disabled={!token}
                      minLength={8}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-on-surface outline-none transition-all duration-200 placeholder:text-outline/50 focus:border-secondary focus:ring-4 focus:ring-secondary/5 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirmation((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-outline hover:text-primary"
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {passwordConfirmation.length > 0 &&
                    newPassword !== passwordConfirmation && (
                      <p className="mt-1.5 text-xs text-red-500">
                        As senhas não coincidem.
                      </p>
                    )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full cursor-pointer rounded-xl bg-primary py-4 font-bold text-white shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.12)] transition-all duration-300 hover:bg-primary-container active:scale-95 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
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
                      Redefinindo...
                    </span>
                  ) : (
                    "Redefinir senha"
                  )}
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-sm text-on-surface-variant">
                  <Link
                    href="/login"
                    className="font-bold text-primary underline decoration-tertiary-fixed-dim decoration-2 underline-offset-4 transition-colors hover:text-secondary"
                  >
                    Voltar ao login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
