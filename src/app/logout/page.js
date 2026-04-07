"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

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
    <main className="relative flex min-h-screen flex-grow items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-primary-container pt-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-[5%] -top-[10%] h-96 w-96 rounded-full bg-secondary-container blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[5%] h-96 w-96 rounded-full bg-primary-container blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto grid grid-cols-12 items-center gap-8 px-6">
        {/* Left content */}
        <div className="col-span-12 flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
          {/* Icon */}
          <div className="mb-8 rounded-full border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-fixed-dim shadow-lg">
              <GraduationCap size={36} className="text-primary" />
            </div>
          </div>

          <h1 className="font-headline mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Até logo!
          </h1>

          <p className="mb-12 max-w-xl text-lg leading-relaxed text-blue-100/80 md:text-xl">
            Você saiu da sua conta com sucesso. Esperamos te ver em breve para
            continuar sua jornada de excelência acadêmica.
          </p>

          <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row lg:max-w-none">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim px-10 py-4 text-lg font-bold text-primary shadow-[0px_24px_48px_-12px_rgba(255,186,32,0.3)] transition-transform hover:scale-[1.02] active:scale-95"
            >
              Entrar novamente
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/20 bg-white/10 px-10 py-4 text-center text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Explorar sem conta
            </Link>
          </div>
        </div>

        {/* Right decorative image */}
        <div className="relative col-span-5 hidden justify-end lg:flex">
          <div className="relative aspect-[4/5] w-full max-w-md">
            <div className="absolute inset-0 -rotate-6 scale-95 rounded-3xl border border-white/10 bg-white/5" />
            <div className="absolute inset-0 rotate-3 scale-100 overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
              <img
                src="/logout-card.jpg"
                alt="Universidade"
                className="h-full w-full object-cover opacity-60 grayscale mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-tertiary-fixed-dim">
                  Academic Journal 2024
                </div>
                <div className="font-headline text-2xl italic leading-snug text-white">
                  &ldquo;Conhecimento é a única riqueza que cresce quando
                  compartilhada.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
