"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, AtSign, Lock, Eye, EyeOff, Zap } from "lucide-react";
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
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const googleError = searchParams.get("error");
    if (googleError && GOOGLE_AUTH_ERRORS[googleError]) {
      setError(GOOGLE_AUTH_ERRORS[googleError]);
    }
  }, [searchParams]);

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
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between"
        style={{ backgroundColor: "#0F2854" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial purple glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

        {/* Logo at top */}
        <div className="relative z-10 p-12">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="blue-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="blue-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 px-12 pb-16">
          <div className="stagger-1 mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Zap size={13} />
            <span>Avaliações verificadas por estudantes</span>
          </div>

          <h2 className="stagger-2 text-4xl font-extrabold tracking-tight text-white">
            A voz dos estudantes{" "}
            <span className="blue-gradient-text">importa aqui.</span>
          </h2>

          <p className="stagger-3 mt-4 text-base text-gray-400">
            Avaliações reais, transparentes e diretas de alunos e ex-alunos.
            Descubra o que te espera antes da matrícula.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">500+</span>
              <span className="text-xs text-gray-400">universidades</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">4.2</span>
              <span className="text-xs text-gray-400">nota média</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="flex items-center gap-1 text-xl font-bold text-white">
                <Zap size={16} className="text-sky-400" />
                100%
              </span>
              <span className="text-xs text-gray-400">verificadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        {/* Mobile logo — hidden on large screens */}
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="blue-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="blue-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Bem-vindo de volta
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Entre para ver as avaliações e deixar a sua
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
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

            <GoogleAuthButton label="Entrar com Google" intent="login" />

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">ou</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Identifier */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="identifier"
                  className="text-sm font-medium text-gray-700"
                >
                  Email ou nome de usuário
                </label>
                <div className="relative">
                  <AtSign
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="seu@email.com ou AgilOnca472"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="blue-gradient mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:underline"
            >
              Cadastrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
