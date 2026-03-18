"use client";

import Link from "next/link";
import { Construction, ArrowLeft, Zap, Bell } from "lucide-react";

export default function EmBrevePage() {
  return (
    <main
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0F2854" }}
    >
      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0 opacity-40" />

      {/* Radial glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-sky-700/30 to-transparent blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Animated construction icon */}
        <div className="stagger-1 mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-sky-400/20 bg-sky-500/10 backdrop-blur-sm">
          <Construction size={44} className="text-sky-400" />
        </div>

        {/* Badge */}
        <div className="stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Zap size={13} />
          <span>Novidade chegando</span>
        </div>

        {/* Heading */}
        <h1 className="stagger-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Estamos construindo{" "}
          <span className="blue-gradient-text">algo incrível</span>
        </h1>

        {/* Description */}
        <p className="stagger-3 mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-400">
          Essa funcionalidade ainda está sendo desenvolvida pelo nosso time.
          Em breve ela estará disponível pra você!
        </p>

        {/* Progress bar */}
        <div className="stagger-3 mx-auto mt-8 w-full max-w-xs">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Progresso</span>
            <span className="text-sky-400">Em desenvolvimento</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: "35%",
                background: "linear-gradient(90deg, #1C4D8D, #4988C4)",
              }}
            />
          </div>
        </div>

        {/* Notify CTA */}
        <div className="stagger-3 mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/universities"
            className="blue-gradient flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <ArrowLeft size={16} />
            Explorar universidades
          </Link>
        </div>

        {/* Feature chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {[
            "Rankings de universidades",
            "Comparativo salarial",
            "Blog e novidades",
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-400 backdrop-blur-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
