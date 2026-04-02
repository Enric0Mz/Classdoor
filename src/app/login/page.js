"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { translateError } from "@/lib/errorMessages";

const GOOGLE_AUTH_ERRORS = {
  google_auth_denied: "Login com Google foi cancelado.",
  google_auth_failed: "Falha ao autenticar com Google. Tente novamente.",
  google_no_account:
    "Nenhuma conta encontrada com esse email Google. Cadastre-se primeiro.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    const googleError = searchParams.get("error");
    if (googleError && GOOGLE_AUTH_ERRORS[googleError]) {
      setError(GOOGLE_AUTH_ERRORS[googleError]);
    }
  }, [searchParams]);

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
      const response = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(data.error?.message, "Email ou senha inválidos."),
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/universities");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-24" style={{ background: "linear-gradient(135deg, #001337 0%, #0f2854 100%)" }}>
        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="/hero-banner.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Geometric decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute top-1/2 -right-48 h-[600px] w-[600px] rounded-full border border-white/5" />
        </div>

        {/* Content */}
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
            A voz dos estudantes importa aqui.
          </h1>

          <p className="mb-12 max-w-md text-lg leading-relaxed text-on-primary-container">
            Descubra avaliações autênticas, explore bolsas de estudo e
            conecte-se com a realidade da vida acadêmica.
          </p>

          {/* Stats */}
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

          {/* Tagline */}
          <div className="mt-16 flex items-center gap-4 text-sm italic text-slate-400">
            <div className="h-px w-12 bg-white/20" />
            <span>Curadoria acadêmica digital de excelência.</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white p-8 md:p-16 lg:w-1/2 lg:p-24">
        <div className="w-full max-w-md">
          {/* Mobile logo — hidden on large screens */}
          <div className="mb-12 flex justify-center lg:hidden">
            <Link
              href="/"
              className="font-headline text-3xl font-bold tracking-tight text-primary"
            >
              InfoCampus
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-headline mb-3 text-3xl font-bold text-primary">
              Bem-vindo de volta
            </h2>
            <p className="text-on-surface-variant">
              Acesse sua conta para continuar sua jornada acadêmica.
            </p>
          </div>

          {/* Error message */}
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

          {/* Google auth */}
          <div className="mb-8">
            <GoogleAuthButton label="Entrar com Google" intent="login" />
          </div>

          {/* Divider */}
          <div className="mb-8 flex items-center">
            <div className="flex-grow border-t border-outline-variant/30" />
            <span className="mx-4 shrink-0 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              ou use seu e-mail
            </span>
            <div className="flex-grow border-t border-outline-variant/30" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-semibold text-primary"
              >
                E-mail ou nome de usuário
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-all duration-200 placeholder:text-outline/50 focus:border-secondary focus:ring-4 focus:ring-secondary/5"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-primary"
                >
                  Senha
                </label>
                <Link
                  href="/em-breve"
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-10 text-on-surface outline-none transition-all duration-200 placeholder:text-outline/50 focus:border-secondary focus:ring-4 focus:ring-secondary/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-outline hover:text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember"
                className="text-sm text-on-surface-variant"
              >
                Lembrar de mim
              </label>
            </div>

            {/* Submit */}
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
                  Entrando...
                </span>
              ) : (
                "Entrar na Plataforma"
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-12 text-center">
            <p className="text-sm text-on-surface-variant">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="font-bold text-primary underline decoration-tertiary-fixed-dim decoration-2 underline-offset-4 transition-colors hover:text-secondary"
              >
                Cadastrar agora
              </Link>
            </p>
          </div>

          {/* Legal footer */}
          <div className="mt-24 border-t border-surface-container-high pt-8 text-center">
            <p className="text-[10px] uppercase leading-relaxed tracking-widest text-outline">
              Ao entrar, você concorda com nossos
              <br />
              <Link
                href="/em-breve"
                className="transition-colors hover:text-primary"
              >
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link
                href="/em-breve"
                className="transition-colors hover:text-primary"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
