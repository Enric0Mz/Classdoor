"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

export default function CreateUniversityFromSubmissionPage() {
  const router = useRouter();
  const { id: submissionId } = useParams();
  const [authorized, setAuthorized] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [website, setWebsite] = useState("");
  const [image, setImage] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [courses, setCourses] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/login");
      return;
    }

    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeJwtPayload(storedToken);
      if (!decoded || decoded.role !== "ADMIN") {
        router.replace("/");
        return;
      }
    }

    setAuthorized(true);
  }, [router]);

  // Fetch submission data
  useEffect(() => {
    if (!authorized) return;

    async function fetchSubmission() {
      try {
        const response = await fetchWithAuth(
          `/api/v1/university-submissions/${submissionId}`,
        );

        if (!response.ok) {
          throw new Error("Sugestao nao encontrada.");
        }

        const data = await response.json();
        setSubmission(data);
        setName(data.name || "");
        setLocation(data.location || "");
        setType(data.type || "");
        setWebsite(data.website || "");
        setEmailDomain(data.emailDomain || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingSubmission(false);
      }
    }

    fetchSubmission();
  }, [authorized, submissionId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Parse courses from comma-separated string
      const courseList = courses
        .split(",")
        .map((course) => course.trim())
        .filter(Boolean);

      // Step 1: Create the university
      const createResponse = await fetchWithAuth("/api/v1/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          type,
          website: website.trim() || undefined,
          image: image.trim() || undefined,
          courses: courseList.length > 0 ? courseList : undefined,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(
          createData.error?.message || "Erro ao criar universidade.",
        );
      }

      // Step 2: Approve the submission and link it to the created university
      const approveResponse = await fetchWithAuth(
        `/api/v1/university-submissions/${submissionId}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            universityId: createData.id,
            emailDomain: emailDomain.trim() || undefined,
          }),
        },
      );

      if (!approveResponse.ok) {
        const approveData = await approveResponse.json().catch(() => ({}));
        throw new Error(
          approveData.error?.message || "Erro ao aprovar sugestao.",
        );
      }

      router.push("/admin/university-submissions");
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        router.push("/login");
        return;
      }
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!authorized) return null;

  if (isLoadingSubmission) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="skeleton mb-6 h-8 w-64 rounded-lg" />
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/admin/university-submissions"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Voltar para sugestoes
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Criar universidade
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Preencha os dados completos para criar a universidade a partir da
          sugestao de{" "}
          <span className="font-medium text-gray-700">
            {submission?.submitter?.username || "usuario"}
          </span>
        </p>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
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
                Nome <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Localidade <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Ex: Sao Paulo, SP"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Type */}
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
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Publica
                </button>
                <button
                  type="button"
                  onClick={() => setType("PRIVATE")}
                  className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-medium transition-all ${
                    type === "PRIVATE"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Privada
                </button>
              </div>
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

            {/* Email Domain */}
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

            {/* Image */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                URL da imagem{" "}
                <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Courses */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Cursos{" "}
                <span className="font-normal text-gray-400">
                  (separados por virgula, opcional)
                </span>
              </label>
              <textarea
                rows={3}
                value={courses}
                onChange={(e) => setCourses(e.target.value)}
                placeholder="Engenharia, Medicina, Direito..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitting ? (
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
                "Criar universidade e aprovar sugestao"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
