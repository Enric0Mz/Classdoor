"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";

const NAVIGATION_LINKS = [
  { label: "Sobre", href: "/em-breve", underline: true },
  { label: "Blog", href: "/em-breve", underline: false },
];

const LEGAL_LINKS = [
  { label: "Termos", href: "/em-breve" },
  { label: "Privacidade", href: "/em-breve" },
];

const HIDDEN_ROUTES = [
  "/login",
  "/logout",
  "/register",
  "/sugerir-universidade",
  "/avaliar",
  "/em-breve",
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  if (HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <footer className="mt-auto w-full border-t border-blue-900/30 bg-blue-950">
      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 py-12 md:grid-cols-4">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="font-headline mb-4 block text-xl font-bold text-yellow-500"
          >
            InfoCampus
          </Link>
          <p className="text-xs font-normal uppercase leading-relaxed tracking-widest text-slate-400">
            Excelência Acadêmica Curada.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Navegação
          </h4>
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-xs uppercase tracking-widest text-slate-400 transition-colors hover:text-white ${
                link.underline
                  ? "underline decoration-yellow-500 underline-offset-4"
                  : "hover:opacity-80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Legal
          </h4>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs uppercase tracking-widest text-slate-400 transition-colors hover:text-white hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Novidades
          </h4>
          <p className="mb-2 text-xs text-slate-400">
            Assine para receber novos rankings.
          </p>
          <form onSubmit={(event) => event.preventDefault()} className="flex">
            <input
              type="email"
              placeholder="E-MAIL"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-blue-900/50 bg-blue-900/20 p-2 text-xs text-white placeholder:text-slate-500 focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="cursor-pointer bg-yellow-500 px-4 py-2 font-bold text-blue-950 transition-opacity hover:opacity-80"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl border-t border-blue-900/30 px-8 py-6">
        <p className="text-center text-xs uppercase tracking-widest text-slate-400 md:text-left">
          &copy; 2024 InfoCampus. Excelência Acadêmica Curada.
        </p>
      </div>
    </footer>
  );
}
