"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, GraduationCap, Menu, X, Zap, UserCircle, LogOut } from "lucide-react";

const NAV_LINKS = [
  { label: "Explorar 🔍", href: "/universities" },
  { label: "Rankings 🏆", href: "#" },
  { label: "Cursos 📚", href: "#" },
  { label: "Salários 💰", href: "#" },
];

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
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    setIsDropdownOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <GraduationCap size={20} />
          </div>
          <span className="brand-gradient-text text-[1.3rem] font-extrabold tracking-tight">
            classdoor
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="ml-8 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-[0.88rem] transition-all ${
                  isActive
                    ? "bg-indigo-50 font-semibold text-indigo-600"
                    : "font-normal text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search — hidden on mobile */}
          <div className="hidden items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2 sm:flex">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Busca aí..."
              className="w-40 bg-transparent text-[0.85rem] text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Bell */}
          <button className="relative cursor-pointer rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-500" />
          </button>

          {/* Avaliar — hidden on mobile */}
          <Link
            href="#"
            className="brand-gradient hidden items-center gap-2 rounded-xl px-4 py-2 text-[0.85rem] text-white transition-opacity hover:opacity-90 sm:flex"
          >
            <Zap size={16} />
            Avaliar
          </Link>

          {/* Auth area */}
          {userEmail ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="brand-gradient flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[0.75rem] font-semibold text-white transition-opacity hover:opacity-80"
                title={userEmail}
              >
                {getInitials(userEmail)}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-11 w-52 rounded-xl border border-gray-100 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm text-gray-500">{userEmail}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/me"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
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
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Cadastrar
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="cursor-pointer p-2 text-gray-500 md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          {/* Mobile search */}
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 sm:hidden">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Busca aí..."
              className="w-full bg-transparent text-[0.85rem] text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Mobile nav links */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block py-2.5 text-[0.9rem] text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Avaliar button */}
          <Link
            href="#"
            className="brand-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[0.85rem] text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Zap size={16} />
            Avaliar uma universidade
          </Link>
        </div>
      )}
    </header>
  );
}
