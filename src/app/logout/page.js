"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GraduationCap, LogOut, Zap } from "lucide-react";

export default function LogoutPage() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("auth-change"));

    if (token && refreshToken) {
      fetch("/api/v1/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
  }, []);

  return (
    <main
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0F2854" }}
    >
      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0 opacity-40" />

      {/* Radial purple glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Logo */}
        <Link href="/" className="mb-12 inline-flex items-center gap-2.5">
          <div className="blue-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <GraduationCap size={22} />
          </div>
          <span className="blue-gradient-text text-[1.4rem] font-extrabold tracking-tight">
            InfoCampus
          </span>
        </Link>

        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <LogOut size={32} className="text-gray-400" />
        </div>

        {/* Badge */}
        <div className="stagger-1 mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Zap size={13} />
          <span>Sessão encerrada com segurança</span>
        </div>

        {/* Message */}
        <h1 className="stagger-2 text-4xl font-extrabold tracking-tight text-white">
          Até logo!
        </h1>
        <p className="stagger-3 mt-3 max-w-xs text-base text-gray-400">
          Você saiu da sua conta com sucesso. Esperamos te ver em breve.
        </p>

        {/* Actions */}
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/login"
            className="blue-gradient flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Entrar novamente
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-white"
          >
            Explorar sem conta
          </Link>
        </div>

        {/* Quick chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {["Explorar universidades", "Ver rankings", "Encontrar cursos"].map(
            (chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-400 backdrop-blur-sm"
              >
                {chip}
              </span>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
