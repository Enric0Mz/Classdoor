"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  CheckCircle,
  XCircle,
  Zap,
  Loader2,
} from "lucide-react";

function VerifyEmailContent() {
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
        const response = await fetch("/api/v1/users/me/email/verify", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          const data = await response.json();
          setStatus("error");
          setErrorMessage(
            data?.error?.message || "Não foi possível verificar o e-mail.",
          );
        }
      } catch {
        setStatus("error");
        setErrorMessage(
          "Ocorreu um erro inesperado. Por favor, tente novamente.",
        );
      }
    }

    submitVerification();
  }, [token]);

  const statusIcon = {
    verifying: <Loader2 size={32} className="animate-spin text-indigo-400" />,
    success: <CheckCircle size={32} className="text-emerald-400" />,
    error: <XCircle size={32} className="text-red-400" />,
  };

  const badgeText = {
    verifying: "Verificando e-mail",
    success: "E-mail verificado com sucesso",
    error: "Falha na verificação",
  };

  const headingText = {
    verifying: "Só um momento...",
    success: "E-mail verificado!",
    error: "Algo deu errado",
  };

  const descriptionText = {
    verifying: "Estamos confirmando seu endereço de e-mail.",
    success: "Seu endereço de e-mail foi confirmado com sucesso.",
    error: errorMessage,
  };

  return (
    <main
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0F2854" }}
    >
      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0 opacity-40" />

      {/* Radial purple glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Logo */}
        <Link href="/" className="mb-12 inline-flex items-center gap-2.5">
          <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <GraduationCap size={22} />
          </div>
          <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
            InfoCampus
          </span>
        </Link>

        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          {status === "verifying" ? (
            statusIcon.verifying
          ) : (
            <Mail size={32} className="text-gray-400" />
          )}
        </div>

        {/* Badge */}
        <div className="stagger-1 mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Zap size={13} />
          <span>{badgeText[status]}</span>
        </div>

        {/* Heading */}
        <h1 className="stagger-2 text-4xl font-extrabold tracking-tight text-white">
          {headingText[status]}
        </h1>
        <p className="stagger-3 mt-3 max-w-xs text-base text-gray-400">
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
              className="brand-gradient flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Ver meu perfil
            </Link>
            <Link
              href="/universities"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
            >
              Explorar universidades
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/"
              className="brand-gradient flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Voltar ao início
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
            >
              Ir para login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main
          className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#0F2854" }}
        >
          <div className="dot-grid absolute inset-0 opacity-40" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p className="mt-4 text-gray-400">Carregando...</p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
