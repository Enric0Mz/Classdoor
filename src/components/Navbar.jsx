"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, UserCircle, LogOut } from "lucide-react";

const NAV_LINKS = [
  { label: "Explorar", href: "/" },
  { label: "Rankings", href: "/em-breve" },
  { label: "Cursos", href: "/courses" },
  { label: "Salários", href: "/em-breve" },
];

const HIDDEN_ROUTES = ["/login", "/logout", "/register", "/avaliar"];

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
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setIsDropdownOpen(false);
    router.push("/logout");
  }

  if (HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <header className="fixed top-0 z-50 w-full bg-white/70 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-headline text-2xl font-bold tracking-tight text-blue-950"
          >
            InfoCampus
          </Link>

          {/* Desktop search */}
          <div className="hidden items-center rounded-lg border border-outline-variant/20 bg-slate-50 px-3 py-1.5 lg:flex">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar universidades..."
              className="w-56 border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-slate-400 focus:ring-0"
            />
          </div>
        </div>

        {/* Center: Nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "border-b-2 border-yellow-500 pb-1 font-bold text-blue-700"
                    : "font-normal text-slate-600 hover:text-blue-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-4">
          <Link
            href="/avaliar"
            className="hidden rounded-lg bg-tertiary-fixed-dim px-5 py-2 text-sm font-bold text-primary transition-all duration-150 ease-in-out hover:brightness-110 active:scale-95 sm:block"
          >
            Avaliar
          </Link>
          {userEmail ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-semibold text-white transition-opacity hover:opacity-80"
                title={userEmail}
              >
                {getInitials(userEmail)}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-11 w-52 rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm text-slate-500">
                      {userEmail}
                    </p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/me"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <UserCircle size={15} />
                      Ver perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100/50 sm:block"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="hidden rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-all duration-150 ease-in-out active:scale-95 sm:block"
              >
                Cadastrar
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="cursor-pointer p-2 text-slate-600 transition-colors hover:text-slate-900 md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-3 md:hidden">
          {/* Mobile search */}
          <div className="mb-3 flex items-center rounded-lg border border-outline-variant/20 bg-slate-50 px-3 py-2.5 sm:hidden">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar universidades..."
              className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-slate-400 focus:ring-0"
            />
          </div>

          {/* Mobile nav links */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block py-2.5 text-sm text-slate-600 transition-colors hover:text-blue-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile auth */}
          {!userEmail && (
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <Link
                href="/login"
                className="text-center text-sm text-slate-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Avaliar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
