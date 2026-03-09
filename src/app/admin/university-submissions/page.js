"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
  Globe,
  AtSign,
  Building,
} from "lucide-react";
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

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_TABS = [
  {
    label: "Pendentes",
    value: "PENDING",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  {
    label: "Aprovadas",
    value: "APPROVED",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
  {
    label: "Rejeitadas",
    value: "REJECTED",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
];

function StatusBadge({ status }) {
  const statusConfig = {
    PENDING: {
      label: "Pendente",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    APPROVED: {
      label: "Aprovada",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    REJECTED: {
      label: "Rejeitada",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function AdminUniversitySubmissionsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState("PENDING");

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

  useEffect(() => {
    if (!authorized) return;

    async function fetchSubmissions() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(
          `/api/v1/university-submissions?status=${activeStatus}&limit=50`,
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error?.message || "Erro ao carregar sugestoes.");
        }

        const data = await response.json();
        setSubmissions(data.data ?? []);
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

    fetchSubmissions();
  }, [authorized, activeStatus]);

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Sugestoes de universidades
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as sugestoes enviadas pelos usuarios
          </p>
        </div>

        {/* Status Tabs */}
        <div className="mb-6 flex gap-2">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="skeleton h-5 w-48 rounded" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                </div>
                <div className="mt-3 flex gap-4">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-4 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-white px-5 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-gray-50"
            >
              Tentar novamente
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Building size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Nenhuma sugestao{" "}
              {activeStatus === "PENDING"
                ? "pendente"
                : activeStatus === "APPROVED"
                  ? "aprovada"
                  : "rejeitada"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeStatus === "PENDING"
                ? "Todas as sugestoes foram analisadas."
                : "Nenhuma sugestao com esse status ainda."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {submission.name}
                      </h3>
                      <StatusBadge status={submission.status} />
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {submission.type === "PUBLIC" ? "Publica" : "Privada"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
                      {submission.emailDomain && (
                        <span className="flex items-center gap-1">
                          <AtSign size={12} />
                          {submission.emailDomain}
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

                    {submission.reason && (
                      <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        <span className="font-medium">Motivo:</span>{" "}
                        {submission.reason}
                      </p>
                    )}
                  </div>

                  {/* Actions for pending submissions */}
                  {submission.status === "PENDING" && (
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/admin/university-submissions/${submission.id}/create`}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                      >
                        Criar
                      </Link>
                      <Link
                        href={`/admin/university-submissions/${submission.id}/reject`}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Rejeitar
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
