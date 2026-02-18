"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function getEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

function getInitials(email) {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    function updateUser() {
      const token = localStorage.getItem("token");
      if (token) {
        setUserEmail(getEmailFromToken(token));
      } else {
        setUserEmail(null);
      }
    }

    updateUser();
    window.addEventListener("auth-change", updateUser);
    return () => window.removeEventListener("auth-change", updateUser);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-6 py-3">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-semibold text-primary">
          classdoor
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/universities"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Explorar
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Rankings
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Cursos
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Salários
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Busca aí..."
            className="h-9 w-56 rounded-lg bg-input-background px-3 pr-8 text-sm outline-none placeholder:text-muted-foreground"
          />
          <svg
            className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <Link
          href="#"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Avaliar
        </Link>
        {userEmail ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground"
            title={userEmail}
          >
            {getInitials(userEmail)}
          </div>
        ) : (
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Cadastrar
          </Link>
        )}
      </div>
    </nav>
  );
}
