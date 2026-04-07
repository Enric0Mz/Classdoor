"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { translateError } from "@/lib/errorMessages";
import {
  fetchWithAuth,
  AuthExpiredError,
  isAuthenticated as checkAuth,
} from "@/lib/fetchWithAuth";

const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function SugerirUniversidadePage() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/register");
      return;
    }
    setToken(localStorage.getItem("token"));
  }, [router]);

  function validate() {
    if (!name.trim()) return "O nome da universidade é obrigatório.";
    if (!type) return "Selecione o tipo da universidade.";
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchWithAuth("/api/v1/university-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          location: location || undefined,
          website: website.trim() || undefined,
          emailDomain: emailDomain.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateError(data.error?.message, "Erro ao enviar sugestão."),
        );
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        router.push("/login");
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) return null;

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4">
        {/* Abstract background */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M45.7,-78.2C58.9,-71.1,69.1,-58.5,76.4,-44.7C83.7,-30.9,88.1,-15.5,86.8,-0.7C85.5,14,78.6,28.1,69.8,40.3C61,52.5,50.3,62.9,37.8,70.1C25.3,77.3,11,81.3,-3.8,87.9C-18.6,94.5,-33.9,103.7,-47.2,100.8C-60.5,97.9,-71.8,82.9,-80,67.6C-88.2,52.3,-93.3,36.7,-95.1,20.8C-96.9,4.9,-95.4,-11.3,-88.7,-25.2C-82,-39.1,-70.1,-50.7,-56.9,-57.8C-43.7,-64.9,-29.2,-67.5,-15.4,-72.1C-1.6,-76.7,12.5,-83.3,45.7,-78.2Z"
              fill="#ffffff"
              transform="translate(200 200)"
            />
          </svg>
        </div>

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-400/20 bg-green-500/10 text-green-400">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-bold text-white">
              Sugestão enviada com sucesso!
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Ela será analisada pela nossa equipe. Você pode acompanhar o
              status na sua página de perfil.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/me"
              className="rounded-xl bg-tertiary-fixed-dim px-6 py-3 text-sm font-bold text-primary transition-all hover:brightness-110"
            >
              Ver meu perfil
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
            >
              Ver universidades
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 pb-20 pt-24">
      {/* Abstract background */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
        <svg
          className="h-full w-full"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M45.7,-78.2C58.9,-71.1,69.1,-58.5,76.4,-44.7C83.7,-30.9,88.1,-15.5,86.8,-0.7C85.5,14,78.6,28.1,69.8,40.3C61,52.5,50.3,62.9,37.8,70.1C25.3,77.3,11,81.3,-3.8,87.9C-18.6,94.5,-33.9,103.7,-47.2,100.8C-60.5,97.9,-71.8,82.9,-80,67.6C-88.2,52.3,-93.3,36.7,-95.1,20.8C-96.9,4.9,-95.4,-11.3,-88.7,-25.2C-82,-39.1,-70.1,-50.7,-56.9,-57.8C-43.7,-64.9,-29.2,-67.5,-15.4,-72.1C-1.6,-76.7,12.5,-83.3,45.7,-78.2Z"
            fill="#ffffff"
            transform="translate(200 200)"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-headline mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Sugerir Universidade
          </h1>
          <p className="mx-auto max-w-md text-lg text-slate-300">
            Não encontrou sua universidade? Sugira para que ela seja adicionada.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-surface-container-lowest p-8 shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.08)] md:p-12">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Nome da universidade <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Universidade de São Paulo"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Tipo */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("PUBLIC")}
                    className={`flex-1 cursor-pointer rounded-xl border py-3 text-center text-sm font-bold transition-all ${
                      type === "PUBLIC"
                        ? "border-secondary bg-secondary-container text-on-secondary-container"
                        : "border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface"
                    }`}
                  >
                    Pública
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("PRIVATE")}
                    className={`flex-1 cursor-pointer rounded-xl border py-3 text-center text-sm font-bold transition-all ${
                      type === "PRIVATE"
                        ? "border-secondary bg-secondary-container text-on-secondary-container"
                        : "border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface"
                    }`}
                  >
                    Privada
                  </button>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Estado
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="">Selecione o estado</option>
                  {BRAZILIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Website{" "}
                  <span className="text-xs font-normal text-outline">
                    (Opcional)
                  </span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.exemplo.edu.br"
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              {/* Domínio de email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Domínio de email{" "}
                  <span className="text-xs font-normal text-outline">
                    (Opcional)
                  </span>
                </label>
                <input
                  type="text"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="@usp.br"
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-6 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer rounded-xl bg-tertiary-fixed-dim py-4 text-lg font-bold text-primary shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.08)] transition-all hover:brightness-105 active:scale-95 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
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
                    Enviando...
                  </span>
                ) : (
                  "Enviar sugestão"
                )}
              </button>

              <Link
                href="/"
                className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
              >
                <ArrowLeft size={16} />
                Voltar para universidades
              </Link>
            </div>
          </form>
        </div>

        {/* Trust badge */}
        <div className="mt-8 flex items-center justify-center gap-3 opacity-60">
          <ShieldCheck size={18} className="text-slate-400" />
          <span className="text-xs text-slate-400">
            Nossa equipe revisará os dados em até 48 horas úteis.
          </span>
        </div>
      </div>
    </main>
  );
}
