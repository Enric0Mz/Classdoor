"use client";

import Link from "next/link";
import {
  GraduationCap,
  Zap,
  PenLine,
  Linkedin,
  Mail,
  Instagram,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Sobre nós", href: "#" },
  { label: "Como funciona", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Termos de uso", href: "#" },
  { label: "Privacidade", href: "#" },
];

const SOCIAL_LINKS = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* CTA Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
          }}
        >
          {/* Subtle dot overlay for texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <GraduationCap size={28} className="text-white" />
            </div>

            <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
              Não encontrou sua uni?
            </h2>

            <p className="mx-auto mb-8 max-w-md text-[0.92rem] leading-relaxed text-white/80">
              Ajuda a galera e adiciona a universidade que tá faltando aqui. É
              rapidinho! &#9889;
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/sugerir-universidade"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-[0.88rem] font-semibold text-indigo-600 shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-50 hover:shadow-xl"
              >
                <Zap size={16} />
                Adicionar universidade
              </Link>

              <Link
                href="/avaliar"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-[0.88rem] font-medium text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
              >
                <PenLine size={16} />
                Escrever review
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mt-12 border-t border-gray-200/60 bg-gray-50/80 pt-12 pb-8">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {/* Brand Column */}
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <GraduationCap size={20} />
              </div>
              <span className="brand-gradient-text text-[1.3rem] font-extrabold tracking-tight">
                InfoCampus
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-[0.88rem] leading-relaxed text-gray-500">
              Avaliações reais de universidades feitas por quem tá lá dentro.
              Encontre a uni perfeita pra você! &#127891;
            </p>

            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all hover:border-indigo-300 hover:text-indigo-500 hover:shadow-md hover:shadow-indigo-500/10"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="mb-4 text-[0.8rem] font-bold tracking-widest text-gray-900 uppercase">
              Links Rápidos
            </h3>

            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[0.88rem] text-gray-500 transition-colors hover:text-indigo-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="mb-4 text-[0.8rem] font-bold tracking-widest text-gray-900 uppercase">
              Fique por dentro &#128232;
            </h3>

            <p className="mb-4 text-[0.88rem] leading-relaxed text-gray-500">
              Receba novidades sobre universidades, dicas e rankings toda
              semana!
            </p>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[0.85rem] text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="brand-gradient shrink-0 cursor-pointer rounded-xl px-5 py-2.5 text-[0.85rem] font-semibold text-white shadow-md shadow-indigo-500/20 transition-opacity hover:opacity-90"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200/60 bg-gray-50/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-[0.78rem] text-gray-400 sm:flex-row sm:px-6 lg:px-8">
          <span>Feito pelo time InfoCampus &#128153;</span>
          <span className="font-medium text-indigo-500/70">
            Sua universidade, sua escolha &#9996;
          </span>
          <span>&copy; 2026 InfoCampus</span>
        </div>
      </div>
    </footer>
  );
}
