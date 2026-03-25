"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Lightbulb } from "lucide-react";
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
    if (!name.trim()) return "O nome da universidade e obrigatorio.";
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
      <main
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4"
        style={{ backgroundColor: "#0F2854" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-400/20 bg-green-500/10 backdrop-blur-sm text-green-400">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Sugestao enviada com sucesso!
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Ela sera analisada pela nossa equipe. Voce pode acompanhar o
              status na sua pagina de perfil.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/me"
              className="brand-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Ver meu perfil
            </Link>
            <Link
              href="/universities"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10"
            >
              Ver universidades
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-12"
      style={{ backgroundColor: "#0F2854" }}
    >
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap size={22} />
            </div>
            <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>

          <div className="stagger-1 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Lightbulb size={13} />
            <span>Ajude a comunidade a crescer</span>
          </div>

          <div>
            <h1 className="stagger-2 text-2xl font-semibold tracking-tight text-white">
              Sugerir universidade
            </h1>
            <p className="stagger-3 mt-1.5 text-sm text-gray-400">
              Nao encontrou sua universidade? Sugira para que ela seja
              adicionada
            </p>
          </div>
        </div>

        {/* Card wrapper */}
        <div className="relative">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.45) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)",
              transform: "scale(1.6)",
              filter: "blur(24px)",
            }}
          />

          {/* Form card */}
          <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-xl shadow-black/30">
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              {/* Nome */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Nome da universidade <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Universidade Federal de Minas Gerais"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tipo <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType("PUBLIC")}
                    className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-medium transition-all ${
                      type === "PUBLIC"
                        ? "brand-gradient text-white shadow-sm"
                        : "border border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    Publica
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("PRIVATE")}
                    className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-medium transition-all ${
                      type === "PRIVATE"
                        ? "brand-gradient text-white shadow-sm"
                        : "border border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    Privada
                  </button>
                </div>
              </div>

              {/* Localidade */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Estado{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Selecione um estado...</option>
                  {BRAZILIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Website{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.universidade.edu.br"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Dominio de email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Dominio de email{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  placeholder="ex: usp.br"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="brand-gradient flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
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
                  </>
                ) : (
                  "Enviar sugestao"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link
            href="/universities"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            <ArrowLeft size={14} />
            Voltar para universidades
          </Link>
        </div>
      </div>
    </main>
  );
}
