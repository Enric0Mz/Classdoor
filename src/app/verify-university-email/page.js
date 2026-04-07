"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyUniversityEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("O link de verificação está sem o token necessário.");
      return;
    }

    async function submitVerification() {
      try {
        const response = await fetch(
          "/api/v1/users/me/university-email/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );

        if (response.ok) {
          setStatus("success");
        } else {
          setStatus((previous) => {
            if (previous === "success") return previous;
            return "error";
          });
          const data = await response.json();
          setErrorMessage(
            data?.error?.message ||
              "Não foi possível verificar o e-mail institucional.",
          );
        }
      } catch {
        setStatus((previous) => {
          if (previous === "success") return previous;
          return "error";
        });
        setErrorMessage(
          "Ocorreu um erro inesperado. Por favor, tente novamente.",
        );
      }
    }

    submitVerification();
  }, [token]);

  const statusIcon = {
    verifying: (
      <Loader2 size={32} className="animate-spin text-tertiary-fixed-dim" />
    ),
    success: <CheckCircle size={32} className="text-emerald-400" />,
    error: <XCircle size={32} className="text-red-400" />,
  };

  const badgeText = {
    verifying: "Verificando e-mail institucional",
    success: "E-mail institucional verificado",
    error: "Falha na verificação",
  };

  const headingText = {
    verifying: "Só um momento...",
    success: "E-mail institucional verificado!",
    error: "Algo deu errado",
  };

  const descriptionText = {
    verifying: "Estamos confirmando seu e-mail institucional.",
    success:
      "Seu e-mail institucional foi confirmado. Suas avaliações agora terão selo de verificação.",
    error: errorMessage,
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container pt-16">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-[5%] -top-[10%] h-96 w-96 rounded-full bg-secondary-container blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[5%] h-96 w-96 rounded-full bg-primary-container blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          {status === "verifying" ? (
            statusIcon.verifying
          ) : (
            <GraduationCap size={32} className="text-slate-400" />
          )}
        </div>

        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim">
          <span>{badgeText[status]}</span>
        </div>

        {/* Heading */}
        <h1 className="font-headline text-4xl font-bold tracking-tight text-white">
          {headingText[status]}
        </h1>
        <p className="mt-3 max-w-xs text-base text-slate-300">
          {descriptionText[status]}
        </p>

        {/* Status icon feedback */}
        {status !== "verifying" && (
          <div className="mt-6">{statusIcon[status]}</div>
        )}

        {/* Actions */}
        {status === "success" && (
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/me"
              className="flex items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110"
            >
              Ver meu perfil
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Explorar universidades
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/me"
              className="flex items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim py-2.5 text-sm font-bold text-primary transition-all hover:brightness-110"
            >
              Voltar ao perfil
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Ir para o início
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyUniversityEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container pt-16">
          <div className="relative z-10 flex flex-col items-center text-center">
            <Loader2
              size={32}
              className="animate-spin text-tertiary-fixed-dim"
            />
            <p className="mt-4 text-slate-300">Carregando...</p>
          </div>
        </main>
      }
    >
      <VerifyUniversityEmailContent />
    </Suspense>
  );
}
