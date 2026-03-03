"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  RefreshCw,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { generateUsername } from "@/lib/generateUsername";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState(() => generateUsername());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function refreshUsername() {
    setUsername(generateUsername());
  }

  function validate() {
    if (username.trim().length < 3) {
      return "O nome de usuário deve ter no mínimo 3 caracteres.";
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return "O nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números e underscore.";
    }
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      return "A senha não atende a todos os requisitos.";
    }
    if (password !== passwordConfirmation) {
      return "As senhas não coincidem.";
    }
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
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.error ||
            "Erro ao criar conta. Tente novamente.",
        );
      }

      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/universities");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between"
        style={{ backgroundColor: "#0f0f14" }}
      >
        {/* Dot grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Radial purple glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        {/* Logo at top */}
        <div className="relative z-10 p-12">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 px-12 pb-16">
          <div className="stagger-1 mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Zap size={13} />
            <span>Junte-se a milhares de estudantes</span>
          </div>

          <h2 className="stagger-2 text-4xl font-extrabold tracking-tight text-white">
            Sua opinião{" "}
            <span className="brand-gradient-text">faz a diferença.</span>
          </h2>

          <p className="stagger-3 mt-4 text-base text-gray-400">
            Compartilhe sua experiência e ajude outros estudantes a escolherem a
            universidade certa.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">500+</span>
              <span className="text-xs text-gray-400">universidades</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="text-xl font-bold text-white">4.2</span>
              <span className="text-xs text-gray-400">nota média</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
              <span className="flex items-center gap-1 text-xl font-bold text-white">
                <Zap size={16} className="text-indigo-400" />
                100%
              </span>
              <span className="text-xs text-gray-400">verificadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-gray-50 px-6 py-12">
        {/* Mobile logo — hidden on large screens */}
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <GraduationCap size={22} />
            </div>
            <span className="brand-gradient-text text-[1.4rem] font-extrabold tracking-tight">
              InfoCampus
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Crie sua conta
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Junte-se a quem já avalia universidades de verdade
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5">
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nome de usuário
                  </label>
                  <span className="text-xs text-gray-400">
                    gerado automaticamente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={refreshUsername}
                    title="Gerar outro nome"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Você pode editar ou clicar em{" "}
                  <RefreshCw size={11} className="inline" /> para gerar outro.
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-indigo-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Use seu email institucional (ex: nome@usp.br) para ganhar o
                  selo de verificado.
                </p>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres, com maiúscula e símbolo"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password.length > 0 && <PasswordRules password={password} />}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="passwordConfirmation"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    required
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                {passwordConfirmation.length > 0 &&
                  password !== passwordConfirmation && (
                    <p className="text-xs text-red-500">
                      As senhas não coincidem.
                    </p>
                  )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="brand-gradient mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const PASSWORD_RULES = [
  {
    label: "Entre 8 e 40 caracteres",
    test: (p) => p.length >= 8 && p.length <= 40,
  },
  { label: "1 letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "1 letra minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "1 número", test: (p) => /[0-9]/.test(p) },
  { label: "1 símbolo (!@#$…)", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

function PasswordRules({ password }) {
  return (
    <ul className="flex flex-col gap-1.5 pt-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-2">
            <svg
              className={`h-3.5 w-3.5 shrink-0 transition-colors ${met ? "text-green-500" : "text-gray-300"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`text-xs transition-colors ${met ? "text-green-600" : "text-gray-400"}`}
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
