"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { translateError } from "@/lib/errorMessages";
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
  { label: "Pública", value: "PUBLIC" },
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
    if (!name.trim()) return "Nome da universidade é obrigatório.";
    if (!location.trim()) return "Localização é obrigatória.";
    if (!type) return "Selecione o tipo de instituição.";
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
        throw new Error(
          translateError(data.error?.message, "Erro ao criar universidade."),
        );
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 pb-20 pt-24">
      {/* Abstract background */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-[5%] -top-[10%] h-96 w-96 rounded-full bg-secondary-container blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[5%] h-96 w-96 rounded-full bg-primary-container blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/10 px-4 py-1.5 text-xs font-bold text-tertiary-fixed-dim">
            <Building2 size={13} />
            <span>Painel Admin</span>
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
            Criar universidade
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Adicione uma nova universidade ao catálogo
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-surface-container-lowest p-8 shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.08)]">
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
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Nome da universidade
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Universidade de São Paulo"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Ex: São Paulo, SP"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Tipo de instituição
              </label>
              <div className="flex gap-3">
                {UNIVERSITY_TYPES.map((universityType) => (
                  <button
                    key={universityType.value}
                    type="button"
                    onClick={() => setType(universityType.value)}
                    className={`flex-1 cursor-pointer rounded-xl border py-3 text-sm font-bold transition-all ${
                      type === universityType.value
                        ? "border-secondary bg-secondary-container text-on-secondary-container"
                        : "border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface"
                    }`}
                  >
                    {universityType.label}
                  </button>
                ))}
              </div>
            </div>

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
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://www.universidade.edu.br"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Domínio de e-mail{" "}
                <span className="text-xs font-normal text-outline">
                  (Opcional)
                </span>
              </label>
              <input
                type="text"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="Ex: usp.br"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
              <span className="text-xs text-outline">
                Domínio usado para verificar alunos (ex: usp.br, unicamp.br)
              </span>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                URL da imagem{" "}
                <span className="text-xs font-normal text-outline">
                  (Opcional)
                </span>
              </label>
              <input
                type="url"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {/* Courses */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Cursos{" "}
                <span className="text-xs font-normal text-outline">
                  (Opcional)
                </span>
              </label>
              <input
                type="text"
                value={coursesInput}
                onChange={(event) => setCoursesInput(event.target.value)}
                placeholder="Engenharia, Medicina, Direito"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
              <span className="text-xs text-outline">
                Separe os cursos por vírgula
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim py-3 text-sm font-bold text-primary transition-all hover:brightness-110 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/me"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            Voltar para meu perfil
          </Link>
        </div>
      </div>
    </main>
  );
}
