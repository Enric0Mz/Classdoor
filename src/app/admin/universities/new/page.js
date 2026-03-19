"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Building2 } from "lucide-react";
import {
  fetchWithAuth,
  AuthExpiredError,
  isAuthenticated as checkAuth,
} from "@/lib/fetchWithAuth";

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const UNIVERSITY_TYPES = [
  { label: "Publica", value: "PUBLIC" },
  { label: "Privada", value: "PRIVATE" },
];

export default function CreateUniversityPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [website, setWebsite] = useState("");
  const [image, setImage] = useState("");
  const [coursesInput, setCoursesInput] = useState("");
  const [domain, setDomain] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/login");
      return;
    }
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeJwtPayload(storedToken);
      if (decoded?.role !== "ADMIN") {
        router.replace("/me");
        return;
      }
    }
    setAuthorized(true);
  }, [router]);

  function validate() {
    if (!name.trim()) return "Nome da universidade e obrigatorio.";
    if (!location.trim()) return "Localizacao e obrigatoria.";
    if (!type) return "Selecione o tipo de instituicao.";
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
      const courses = coursesInput
        .split(",")
        .map((course) => course.trim())
        .filter((course) => course.length > 0);

      const body = {
        name: name.trim(),
        location: location.trim(),
        type,
      };
      if (website.trim()) body.website = website.trim();
      if (image.trim()) body.image = image.trim();
      if (courses.length > 0) body.courses = courses;
      if (domain.trim()) body.domain = domain.trim();

      const response = await fetchWithAuth("/api/v1/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Erro ao criar universidade.");
      }

      router.push(`/universities/${data.id}`);
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

  if (!authorized) return null;

  return (
    <main
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-12"
      style={{ backgroundColor: "#0F2854" }}
    >
      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0 opacity-40" />

      {/* Radial purple glow */}
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
            <Building2 size={13} />
            <span>Painel Admin</span>
          </div>

          <div>
            <h1 className="stagger-2 text-2xl font-semibold tracking-tight text-white">
              Criar universidade
            </h1>
            <p className="stagger-3 mt-1.5 text-sm text-gray-400">
              Adicione uma nova universidade ao catalogo
            </p>
          </div>
        </div>

        {/* Card wrapper with glow */}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Nome da universidade
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: Universidade de Sao Paulo"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Localizacao
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Ex: Sao Paulo, SP"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tipo de instituicao
                </label>
                <div className="flex gap-3">
                  {UNIVERSITY_TYPES.map((universityType) => (
                    <button
                      key={universityType.value}
                      type="button"
                      onClick={() => setType(universityType.value)}
                      className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-medium transition-all ${
                        type === universityType.value
                          ? "brand-gradient text-white shadow-sm"
                          : "border border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {universityType.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Website{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://www.universidade.edu.br"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Domain */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Dominio de e-mail{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="Ex: usp.br"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <span className="text-xs text-gray-400">
                  Dominio usado para verificar alunos (ex: usp.br, unicamp.br)
                </span>
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  URL da imagem{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Courses */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Cursos{" "}
                  <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={coursesInput}
                  onChange={(event) => setCoursesInput(event.target.value)}
                  placeholder="Engenharia, Medicina, Direito"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <span className="text-xs text-gray-400">
                  Separe os cursos por virgula
                </span>
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
                    Criando...
                  </>
                ) : (
                  <>
                    <Building2 size={16} />
                    Criar universidade
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link
            href="/me"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            <ArrowLeft size={14} />
            Voltar para meu perfil
          </Link>
        </div>
      </div>
    </main>
  );
}
