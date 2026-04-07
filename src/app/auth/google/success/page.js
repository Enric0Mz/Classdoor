"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function GoogleSuccessContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (!token || !refreshToken) {
      setError("Tokens de autenticação não encontrados.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    window.dispatchEvent(new Event("auth-change"));

    window.location.href = "/";
  }, [searchParams]);

  if (error) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container px-4 pt-16">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <a
            href="/login"
            className="rounded-xl bg-tertiary-fixed-dim px-5 py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110"
          >
            Voltar ao login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container px-4 pt-16">
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <Loader2 size={32} className="animate-spin text-tertiary-fixed-dim" />
        <p className="text-sm text-slate-300">Autenticando com Google...</p>
      </div>
    </main>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container px-4 pt-16">
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <Loader2
              size={32}
              className="animate-spin text-tertiary-fixed-dim"
            />
            <p className="text-sm text-slate-300">Carregando...</p>
          </div>
        </main>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
