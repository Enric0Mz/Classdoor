"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { translateError } from "@/lib/errorMessages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((response) => response.json())
      .then((data) => setPlatformStats(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(
            data.error?.message,
            "Erro ao enviar email. Tente novamente.",
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
            Esqueceu sua senha? Sem problemas.
          </h1>

          <p className="mb-12 max-w-md text-lg leading-relaxed text-on-primary-container">
            Enviaremos um link para você criar uma nova senha e voltar a avaliar
            universidades.
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
                  Email enviado!
                </h2>
                <p className="mt-3 text-on-surface-variant">
                  Se uma conta com esse email existir, enviamos um link para
                  redefinir sua senha. Verifique sua caixa de entrada e spam.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-4 block w-full cursor-pointer rounded-xl bg-primary py-4 text-center font-bold text-white shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.12)] transition-all duration-300 hover:bg-primary-container active:scale-95"
              >
                Voltar ao login
              </Link>
            </>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h2 className="font-headline mb-3 text-3xl font-bold text-primary">
                  Redefinir senha
                </h2>
                <p className="text-on-surface-variant">
                  Digite seu email e enviaremos um link para criar uma nova
                  senha.
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
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-primary"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-all duration-200 placeholder:text-outline/50 focus:border-secondary focus:ring-4 focus:ring-secondary/5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
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
                      Enviando...
                    </span>
                  ) : (
                    "Enviar link de redefinição"
                  )}
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-sm text-on-surface-variant">
                  Lembrou a senha?{" "}
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
