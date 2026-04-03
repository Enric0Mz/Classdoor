"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  X,
  Clock,
  Award,
  Users,

} from "lucide-react";

const CATEGORY_FILTERS = [
  "Tudo",
  "Programação",
  "Design",
  "Marketing",
  "Data Science",
  "Negócios",
  "Saúde",
];

const CATEGORY_API_MAP = {
  Tudo: null,
  Programação: "Programação",
  Design: "Design",
  Marketing: "Marketing",
  "Data Science": "Dados",
  Negócios: "Negócios",
  Saúde: "Outros",
};

function CourseCard({ course }) {
  const gradients = [
    "from-primary to-primary-container",
    "from-primary-container to-primary",
    "from-secondary-container to-primary",
    "from-primary to-secondary-container",
    "from-primary-container to-secondary-container",
  ];
  const gradientIndex = course.id.charCodeAt(0) % gradients.length;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-300 hover:shadow-[0px_24px_48px_-12px_rgba(0,19,55,0.08)]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradients[gradientIndex]}`}
          >
            <BookOpen size={40} className="text-white/60" />
          </div>
        )}
        {course.category && (
          <span className="absolute left-4 top-4 rounded-full bg-tertiary-fixed-dim px-3 py-1 text-xs font-bold text-primary">
            {course.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-headline mb-2 line-clamp-2 text-lg font-bold leading-tight text-primary">
          {course.title}
        </h3>

        {course.description && (
          <p className="mb-4 line-clamp-2 text-sm text-on-surface-variant">
            {course.description}
          </p>
        )}

        <div className="mb-4 flex items-center gap-4 text-xs text-on-surface-variant">
          {course.university && (
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {course.university.name}
            </span>
          )}
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {course.duration}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          {course.price != null ? (
            <span className="font-headline text-lg font-bold text-primary">
              R$ {course.price.toFixed(2)}
            </span>
          ) : (
            <span className="font-headline text-lg font-bold text-tertiary-fixed-dim">
              Gratuito
            </span>
          )}
          <Link
            href={`/courses/${course.id}`}
            className="rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tudo");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/v1/courses?limit=100");
        if (!res.ok) throw new Error("Falha ao carregar cursos");
        const data = await res.json();
        setCourses(data.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = courses;
    if (activeCategory !== "Tudo") {
      const apiCategory = CATEGORY_API_MAP[activeCategory];
      if (apiCategory) {
        result = result.filter((course) => course.category === apiCategory);
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          (course.description &&
            course.description.toLowerCase().includes(query)),
      );
    }
    return result;
  }, [courses, activeCategory, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-background pt-16">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-primary pb-32 pt-20">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left content */}
            <div className="lg:col-span-7">
              <span className="mb-6 inline-block rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim">
                Cursos selecionados
              </span>

              <h1 className="font-headline mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
                Descubra o curso que vai transformar sua carreira acadêmica.
              </h1>

              <p className="mb-10 max-w-xl text-lg text-white/70">
                Cursos cuidadosamente selecionados para alavancar sua carreira
                acadêmica e profissional.
              </p>

              {/* Search bar */}
              <div className="relative max-w-xl">
                <div className="flex items-center rounded-xl border border-white/20 bg-surface-container-lowest p-2 shadow-2xl transition-all focus-within:ring-4 focus-within:ring-secondary/20">
                  <Search size={24} className="mx-4 shrink-0 text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Busque por título ou descrição..."
                    className="flex-grow border-none bg-transparent py-3 text-base text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0"
                  />
                  <button className="shrink-0 cursor-pointer rounded-lg bg-tertiary-fixed-dim px-6 py-3 font-bold text-primary transition-all hover:brightness-110">
                    Pesquisar
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-10 flex gap-10">
                <div className="flex flex-col">
                  <span className="font-headline text-3xl font-bold text-white">
                    {loading ? "..." : courses.length}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Cursos
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-3xl font-bold text-white">
                    {loading
                      ? "..."
                      : new Set(courses.map((c) => c.category).filter(Boolean))
                          .size}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Categorias
                  </span>
                </div>
              </div>
            </div>

            {/* Right decorative image */}
            <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
              <div className="relative rotate-3 overflow-hidden rounded-2xl border-4 border-white/10 shadow-2xl">
                <img
                  src="/courses-hero.jpg"
                  alt="Estudantes"
                  className="h-80 w-72 object-cover"
                />
                <div className="absolute inset-0 bg-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filters ── */}
      <section className="relative z-20 -mt-10 px-8">
        <div className="mx-auto max-w-7xl rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="mr-2 text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
              Filtrar por:
            </span>
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? "bg-secondary-container font-bold text-on-secondary-container hover:brightness-95"
                    : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface"
                }`}
              >
                {category}
              </button>
            ))}
            {(activeCategory !== "Tudo" || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory("Tudo");
                  setSearchQuery("");
                }}
                className="flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-red-500 transition-all hover:bg-red-50"
              >
                <X size={14} />
                Limpar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Course Grid ── */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-headline mb-2 text-3xl font-bold text-primary">
              {activeCategory === "Tudo" ? "Todos os cursos" : activeCategory}
            </h2>
            <p className="text-on-surface-variant">
              {loading ? "..." : filteredCourses.length} cursos encontrados
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl bg-surface-container-lowest"
              >
                <div className="skeleton h-48 w-full" />
                <div className="p-6">
                  <div className="skeleton mb-3 h-5 w-3/4 rounded" />
                  <div className="skeleton mb-3 h-4 w-1/2 rounded" />
                  <div className="skeleton mb-4 h-4 w-full rounded" />
                  <div className="skeleton h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer rounded-lg bg-white px-6 py-2 text-sm font-bold text-red-600 shadow-sm transition-transform hover:scale-105"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-semibold text-on-surface">
              Nenhum curso encontrado
            </h3>
            <p className="max-w-xs text-on-surface-variant">
              Tente ajustar seus filtros ou buscar por outro termo.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Tudo");
              }}
              className="mt-6 cursor-pointer font-medium text-tertiary-fixed-dim hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Section ── */}
      <section className="px-8 pb-24">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 overflow-hidden rounded-3xl bg-primary p-12 md:flex-row md:p-16">
          {/* Left content */}
          <div className="relative z-10 flex-1">
            <span className="mb-4 inline-block rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim">
              Por que nos escolher
            </span>
            <h2 className="font-headline mb-6 text-3xl font-bold text-white md:text-4xl">
              Invista no seu futuro acadêmico
            </h2>
            <p className="mb-8 max-w-lg text-lg text-white/70">
              Nossos cursos são selecionados com rigor para garantir qualidade e
              relevância no mercado.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-fixed-dim/20">
                  <Award size={20} className="text-tertiary-fixed-dim" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white">
                    Certificações Reconhecidas
                  </h4>
                  <p className="text-sm text-white/60">
                    Certificados válidos e reconhecidos pelo mercado acadêmico e
                    profissional.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-fixed-dim/20">
                  <Users size={20} className="text-tertiary-fixed-dim" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white">
                    Networking Estratégico
                  </h4>
                  <p className="text-sm text-white/60">
                    Conecte-se com profissionais e pesquisadores de alto nível.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right decorative image */}
          <div className="relative z-10 hidden lg:block">
            <div className="relative aspect-[4/5] w-72 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src="/courses-featured.jpg"
                alt="Cursos em destaque"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
