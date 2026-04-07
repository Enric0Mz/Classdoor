"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, RefreshCw } from "lucide-react";
import { generateUsername } from "@/lib/generateUsername";
import { translateError } from "@/lib/errorMessages";

function ChooseUsernameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingToken = searchParams.get("token");

  const [username, setUsername] = useState(() => generateUsername());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function refreshUsername() {
    setUsername(generateUsername());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/v1/auth/google/complete-registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendingToken, username }),
        },
      );

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

  if (!pendingToken) {
    return (
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-red-400">
            Sessao de registro expirada. Tente novamente.
          </p>
          <a
            href="/register"
            className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voltar ao cadastro
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      {/* Left branding panel (desktop only) */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        <div className="relative z-10 p-12">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Quase la!{" "}
            <span className="brand-gradient-text">Escolha seu nome.</span>
          </h2>
          <p className="mt-4 text-base text-gray-400">
            Seu nome de usuario e como outros estudantes vao te identificar na
            plataforma.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-gray-50 px-6 py-12">
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Escolha seu nome de usuario
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Voce pode editar ou gerar um novo nome aleatorio
            </p>
          </div>

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

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nome de usuario
                  </label>
                  <span className="text-xs text-gray-400">
                    gerado automaticamente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={refreshUsername}
                    title="Gerar outro nome"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Voce pode editar ou clicar em{" "}
                  <RefreshCw size={11} className="inline" /> para gerar outro.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="brand-gradient mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ChooseUsernamePage() {
  return (
    <Suspense
      fallback={
        <main
          className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
          style={{ backgroundColor: "#0F2854" }}
        >
          <div className="dot-grid absolute inset-0 opacity-40" />
          <div className="relative z-10">
            <svg
              className="h-8 w-8 animate-spin text-indigo-400"
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
          </div>
        </main>
      }
    >
      <ChooseUsernameContent />
    </Suspense>
  );
}
