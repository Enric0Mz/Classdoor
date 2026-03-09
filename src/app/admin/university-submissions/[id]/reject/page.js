"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Globe, User, Calendar } from "lucide-react";
import { fetchWithAuth, AuthExpiredError } from "@/lib/fetchWithAuth";

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RejectSubmissionPage() {
  const router = useRouter();
  const { id: submissionId } = useParams();
  const [token, setToken] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auth guard
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.replace("/login");
      return;
    }

    const decoded = decodeJwtPayload(storedToken);
    if (!decoded || decoded.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    setToken(storedToken);
  }, [router]);

  // Fetch submission
  useEffect(() => {
    if (!token) return;

    async function fetchSubmission() {
      try {
        const response = await fetchWithAuth(
          `/api/v1/university-submissions/${submissionId}`,
        );

        if (!response.ok) throw new Error("Sugestao nao encontrada.");

        const data = await response.json();
        setSubmission(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingSubmission(false);
      }
    }

    fetchSubmission();
  }, [token, submissionId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError("O motivo da rejeicao e obrigatorio.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWithAuth(
        `/api/v1/university-submissions/${submissionId}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Erro ao rejeitar sugestao.");
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

  if (!token) return null;

  if (isLoadingSubmission) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="skeleton mb-6 h-8 w-64 rounded-lg" />
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <p className="text-sm text-red-600">
            {error || "Sugestao nao encontrada."}
          </p>
          <Link
            href="/admin/university-submissions"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>
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
          Rejeitar sugestao
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Explique o motivo da rejeicao para o usuario
        </p>

        {/* Submission details */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Detalhes da sugestao
          </h2>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {submission.name}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {submission.type === "PUBLIC" ? "Publica" : "Privada"}
            </span>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {submission.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {submission.location}
                </span>
              )}
              {submission.website && (
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  {submission.website}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User size={12} />
                {submission.submitter?.username || "Usuario"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(submission.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Motivo da rejeicao <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique brevemente por que essa sugestao foi rejeitada..."
                required
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
                  Rejeitando...
                </>
              ) : (
                "Rejeitar sugestao"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
