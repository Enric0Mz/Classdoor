"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (!token || !refreshToken) {
      setError("Tokens de autenticacao nao encontrados.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    window.dispatchEvent(new Event("auth-change"));

    router.push("/universities");
  }, [searchParams, router]);

  if (error) {
    return (
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
        style={{ backgroundColor: "#0f0f14" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <a
            href="/login"
            className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voltar ao login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
      style={{ backgroundColor: "#0f0f14" }}
    >
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
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
        <p className="text-sm text-gray-400">Autenticando com Google...</p>
      </div>
    </main>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
          style={{ backgroundColor: "#0f0f14" }}
        >
          <div className="dot-grid absolute inset-0 opacity-40" />
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
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
            <p className="text-sm text-gray-400">Carregando...</p>
          </div>
        </main>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
