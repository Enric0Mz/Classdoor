"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { translateError } from "@/lib/errorMessages";
import { RefreshCw } from "lucide-react";
import { generateUsername } from "@/lib/generateUsername";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState(() => generateUsername());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((response) => response.json())
      .then((data) => setPlatformStats(data))
      .catch(() => {});
  }, []);

  function refreshUsername() {
    setUsername(generateUsername());
  }

  function validate() {
    if (username.trim().length < 3) {
      return "O nome de usuário deve ter no mínimo 3 caracteres.";
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return "O nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números e underscore.";
    }
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      return "A senha não atende a todos os requisitos.";
    }
    if (password !== passwordConfirmation) {
      return "As senhas não coincidem.";
    }
    if (!acceptedTerms) {
      return "Você precisa aceitar os Termos de Uso e a Política de Privacidade.";
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
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(
            data.error?.message || data.error,
            "Erro ao criar conta. Tente novamente.",
          ),
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* ── Left branding panel ── */}
      <section
        className="relative hidden w-full flex-col justify-between overflow-hidden p-8 text-white md:flex md:w-[45%] md:p-16 lg:w-[40%]"
        style={{
          background: "linear-gradient(135deg, #001337 0%, #0f2854 100%)",
        }}
      >
        {/* Background texture */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <img
            src="/hero-banner.jpg"
            alt=""
            className="h-full w-full object-cover grayscale"
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-12">
            <Link
              href="/"
              className="font-headline text-2xl font-bold tracking-tight text-white"
            >
              InfoCampus
            </Link>
          </div>

          <h1 className="font-headline mb-6 text-4xl font-bold leading-tight lg:text-5xl">
            Comece sua jornada acadêmica com confiança
          </h1>

          <p className="mb-12 max-w-md text-lg leading-relaxed text-on-primary-container">
            Junte-se a milhares de estudantes e compartilhe sua experiência para
            ajudar outros a encontrarem seu futuro ideal.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-effect rounded-xl border border-white/10 bg-white/[0.05] p-6">
              <div className="mb-1 font-headline text-3xl font-bold text-tertiary-fixed-dim">
                +{platformStats?.universityCount ?? "..."}
              </div>
              <div className="text-xs uppercase tracking-widest text-blue-200/60">
                Universidades
              </div>
            </div>
            <div className="glass-effect rounded-xl border border-white/10 bg-white/[0.05] p-6">
              <div className="mb-1 font-headline text-3xl font-bold text-tertiary-fixed-dim">
                {platformStats?.averageRating ?? "..."}
              </div>
              <div className="text-xs uppercase tracking-widest text-blue-200/60">
                Nota Média
              </div>
            </div>
          </div>
        </div>

        {/* Social proof footer */}
        <div className="relative z-10 mt-16 border-t border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-secondary-container text-xs font-bold text-on-secondary-container">
                AS
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-tertiary-fixed-dim text-xs font-bold text-primary">
                JM
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-on-primary-container text-xs font-bold text-white">
                PL
              </div>
            </div>
            <p className="text-sm text-blue-100/80">
              <span className="font-bold text-white">
                {platformStats
                  ? `${platformStats.reviewCount}+ avaliações`
                  : "Estudantes"}
              </span>{" "}
              publicadas na plataforma.
            </p>
          </div>
        </div>
      </section>

      {/* ── Right form panel ── */}
      <section className="flex w-full items-center justify-center overflow-y-auto bg-surface-container-lowest p-8 md:w-[55%] md:p-12 lg:w-[60%] lg:p-24">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-12 flex justify-center md:hidden">
            <Link
              href="/"
              className="font-headline text-3xl font-bold tracking-tight text-primary"
            >
              InfoCampus
            </Link>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline mb-2 text-3xl font-bold text-primary">
              Crie sua conta
            </h2>
            <p className="text-on-surface-variant">
              Sua voz importa na comunidade InfoCampus.
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
          <GoogleAuthButton label="Cadastrar com Google" />

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-container-lowest px-4 text-xs uppercase tracking-widest text-on-surface-variant">
                ou use seu e-mail
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="ml-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
              >
                Nome de usuário
              </label>
              <div className="group relative">
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  placeholder="ex: acad_pioneer"
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                />
                <button
                  type="button"
                  onClick={refreshUsername}
                  title="Gerar outro nome"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-on-surface-variant transition-colors hover:text-secondary"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="ml-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
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
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="ml-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="passwordConfirmation"
                  className="ml-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                >
                  Confirmar senha
                </label>
                <input
                  id="passwordConfirmation"
                  type="password"
                  required
                  minLength={8}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3.5 text-sm text-on-surface outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Password rules (shown when typing) */}
            {password.length > 0 && <PasswordRules password={password} />}

            {/* Password mismatch */}
            {passwordConfirmation.length > 0 &&
              password !== passwordConfirmation && (
                <p className="text-xs text-red-500">As senhas não coincidem.</p>
              )}

            {/* Terms */}
            <div className="flex items-center gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary-container"
              />
              <label
                htmlFor="terms"
                className="text-xs leading-tight text-on-surface-variant"
              >
                Eu aceito os{" "}
                <Link
                  href="/em-breve"
                  className="font-medium text-secondary hover:underline"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/em-breve"
                  className="font-medium text-secondary hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full cursor-pointer rounded-xl bg-primary py-4 text-sm font-bold tracking-wide text-on-primary shadow-lg shadow-primary/10 transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-60"
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
                  Criando conta...
                </span>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="font-bold text-secondary transition-all hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

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
