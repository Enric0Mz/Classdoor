"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, RefreshCw, Loader2 } from "lucide-react";
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container px-4 pt-16">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-red-400">
            Sessão de registro expirada. Tente novamente.
          </p>
          <a
            href="/register"
            className="rounded-xl bg-tertiary-fixed-dim px-5 py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110"
          >
            Voltar ao cadastro
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen pt-16">
      {/* Left branding panel (desktop only) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary-container lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-[5%] -top-[10%] h-96 w-96 rounded-full bg-secondary-container blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[5%] h-96 w-96 rounded-full bg-primary-container blur-3xl" />
        </div>

        <div className="relative z-10 p-12">
          <Link
            href="/"
            className="font-headline text-xl font-bold text-tertiary-fixed-dim"
          >
            InfoCampus
          </Link>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <h2 className="font-headline text-4xl font-bold tracking-tight text-white">
            Quase lá!{" "}
            <span className="text-tertiary-fixed-dim">Escolha seu nome.</span>
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Seu nome de usuário é como outros estudantes vão te identificar na
            plataforma.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-background px-6 py-12">
        <div className="mb-8 text-center lg:hidden">
          <Link
            href="/"
            className="font-headline text-xl font-bold text-primary"
          >
            InfoCampus
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">
              Escolha seu nome de usuário
            </h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Você pode editar ou gerar um novo nome aleatório
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
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
                    className="text-sm font-semibold text-on-surface-variant"
                  >
                    Nome de usuário
                  </label>
                  <span className="text-xs text-outline">
                    gerado automaticamente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    />
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container py-2.5 pl-9 pr-3 text-sm text-on-surface outline-none transition-all focus:border-secondary focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={refreshUsername}
                    title="Gerar outro nome"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface-variant transition-colors hover:border-secondary hover:bg-secondary-fixed hover:text-on-secondary-container"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
                <p className="text-xs text-outline">
                  Você pode editar ou clicar em{" "}
                  <RefreshCw size={11} className="inline" /> para gerar outro.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container px-4 pt-16">
          <div className="relative z-10">
            <Loader2
              size={32}
              className="animate-spin text-tertiary-fixed-dim"
            />
          </div>
        </main>
      }
    >
      <ChooseUsernameContent />
    </Suspense>
  );
}
