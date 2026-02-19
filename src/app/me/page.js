"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, AtSign, Calendar, ShieldCheck, ShieldAlert, LogOut } from "lucide-react";

function getInitials(user) {
  if (user.username) {
    return user.username.slice(0, 2).toUpperCase();
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "?";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function handleLogout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchUser() {
      try {
        const response = await fetch("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar seu perfil.");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <main className="hero-gradient flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  const initials = getInitials(user);

  return (
    <main>
      {/* Hero band */}
      <section className="hero-gradient px-6 pb-16 pt-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Avatar */}
          <div className="brand-gradient flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg">
            {initials}
          </div>

          {/* Name + badge */}
          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {user.username ?? "Usuário anônimo"}
            </h1>
            {user.verified && (
              <span
                title="Email universitário verificado"
                className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700"
              >
                <ShieldCheck size={12} />
                Verificado
              </span>
            )}
          </div>

          {/* Member since */}
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar size={13} />
            Membro desde {formatDate(user.createdAt)}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex flex-col gap-4">

          {/* Info card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Informações da conta
            </h2>
            <ul className="flex flex-col divide-y divide-gray-50">
              {user.username && (
                <InfoRow
                  icon={<AtSign size={15} />}
                  label="Nome de usuário"
                  value={`@${user.username}`}
                />
              )}
              {user.email && (
                <InfoRow
                  icon={<Mail size={15} />}
                  label="Email"
                  value={user.email}
                />
              )}
              {user.universityEmail && (
                <InfoRow
                  icon={<GraduationCap size={15} />}
                  label="Email universitário"
                  value={user.universityEmail}
                  badge={
                    user.verified ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                        <ShieldCheck size={11} />
                        Verificado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-600">
                        Pendente
                      </span>
                    )
                  }
                />
              )}
              <InfoRow
                icon={<Calendar size={15} />}
                label="Membro desde"
                value={formatDate(user.createdAt)}
              />
            </ul>
          </div>

          {/* Verification CTA — only when not verified */}
          {!user.verified && (
            <div className="flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-900">
                  Obtenha o selo de verificado
                </p>
                <p className="mt-1 text-sm text-indigo-700">
                  Vincule seu email universitário para ganhar o selo{" "}
                  <span className="font-medium">Verificado</span> e mostrar que você
                  realmente estuda ou estudou na universidade que avalia.
                </p>
                <Link
                  href="#"
                  className="brand-gradient mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <GraduationCap size={14} />
                  Verificar email universitário
                </Link>
              </div>
            </div>
          )}
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={15} />
            Sair da conta
          </button>

        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value, badge }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3 text-gray-400">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{value}</span>
        {badge}
      </div>
    </li>
  );
}

function ProfileSkeleton() {
  return (
    <main>
      <section className="hero-gradient px-6 pb-16 pt-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </section>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
