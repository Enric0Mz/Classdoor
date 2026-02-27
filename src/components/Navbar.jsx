"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, GraduationCap, Menu, X, Zap, UserCircle, LogOut } from "lucide-react";

const NAV_LINKS = [
  { label: "Explorar 🔍", href: "/universities" },
  { label: "Rankings 🏆", href: "#" },
  { label: "Cursos 📚", href: "/courses" },
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
    setIsDropdownOpen(false);
    router.push("/logout");
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-indigo-500/20 backdrop-blur-xl shadow-[0_1px_30px_-4px_rgba(99,102,241,0.2)]"
      style={{ background: "linear-gradient(135deg, #0c0c1e 0%, #180c3a 50%, #0c0c1e 100%)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap size={20} />
          </div>
          <span className="text-[1.3rem] font-extrabold tracking-tight">
            <span className="text-indigo-400">Info</span><span className="text-violet-300">Campus</span>
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
                    ? "bg-white/10 font-semibold text-white"
                    : "font-normal text-gray-400 hover:bg-white/5 hover:text-gray-200"
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
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 sm:flex">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Busca aí..."
              className="w-40 bg-transparent text-[0.85rem] text-gray-200 outline-none placeholder:text-gray-600"
            />
          </div>

          {/* Bell */}
          <button className="relative cursor-pointer rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-white/8 hover:text-gray-200">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c0c1e] bg-indigo-500" />
          </button>

          {/* Avaliar — hidden on mobile */}
          <Link
            href={userEmail ? "/avaliar" : "/register"}
            className="brand-gradient hidden items-center gap-2 rounded-xl px-4 py-2 text-[0.85rem] text-white shadow-md shadow-indigo-500/20 transition-opacity hover:opacity-90 sm:flex"
          >
            <Zap size={16} />
            Avaliar
          </Link>

          {/* Auth area */}
          {userEmail ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="brand-gradient flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[0.75rem] font-semibold text-white shadow-md shadow-indigo-500/30 transition-opacity hover:opacity-80"
                title={userEmail}
              >
                {getInitials(userEmail)}
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 top-11 w-52 rounded-xl border border-white/10 shadow-xl shadow-black/40 backdrop-blur-xl"
                  style={{ background: "linear-gradient(135deg, #12102a, #1a1040)" }}
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm text-gray-400">{userEmail}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/me"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <UserCircle size={15} />
                      Ver perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
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
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-indigo-400/50 hover:text-indigo-300"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-opacity hover:opacity-90"
              >
                Cadastrar
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="cursor-pointer p-2 text-gray-400 transition-colors hover:text-gray-200 md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="border-t border-white/10 px-4 py-3 md:hidden"
          style={{ background: "linear-gradient(135deg, #0c0c1e, #180c3a)" }}
        >
          {/* Mobile search */}
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 sm:hidden">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Busca aí..."
              className="w-full bg-transparent text-[0.85rem] text-gray-200 outline-none placeholder:text-gray-600"
            />
          </div>

          {/* Mobile nav links */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block py-2.5 text-[0.9rem] text-gray-400 transition-colors hover:text-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Avaliar button */}
          <Link
            href={userEmail ? "/avaliar" : "/register"}
            className="brand-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[0.85rem] text-white shadow-md shadow-indigo-500/20"
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
