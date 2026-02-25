"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, TrendingUp, X } from "lucide-react";

const CATEGORY_FILTERS = ["Todos", "Programação", "Design", "Marketing", "Negócios", "Dados", "DevOps", "Outros"];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

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
    if (activeCategory !== "Todos") {
      result = result.filter((course) => course.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }
    return result;
  }, [courses, activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pb-16 pt-16 text-center"
        style={{ backgroundColor: "#0f0f14" }}
      >
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-0 -z-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-radial from-violet-900/30 to-transparent blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <div className="stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <BookOpen size={13} />
            <span>Cursos selecionados para você</span>
          </div>

          <h1 className="stagger-2 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Aprenda com os{" "}
            <span className="brand-gradient-text">melhores cursos</span>
          </h1>

          <p className="stagger-3 mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Cursos cuidadosamente selecionados para alavancar sua carreira acadêmica e profissional.
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-all focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-500/60">
              <Search className="mr-3 shrink-0 text-gray-500 group-focus-within:text-indigo-400" size={20} />
              <input
                type="text"
                placeholder="Busque por título ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm w-fit mx-auto">
            <span className="text-xl font-bold text-white">
              {loading ? "..." : courses.length}
            </span>
            <span className="text-xs text-gray-400">cursos disponíveis</span>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category Filter Chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-inset ring-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
          {(activeCategory !== "Todos" || searchQuery) && (
            <button
              onClick={() => { setActiveCategory("Todos"); setSearchQuery(""); }}
              className="flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium text-red-500 ring-1 ring-inset ring-red-200 hover:bg-red-50"
            >
              <X size={14} />
              Limpar
            </button>
          )}
        </div>

        <div className="mb-4 text-sm font-semibold text-gray-700">
          {loading ? "..." : filteredCourses.length} resultados
        </div>

        {/* Grid Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="skeleton h-40 w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="mt-auto skeleton h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white px-6 py-2 text-sm font-bold text-red-600 shadow-sm transition-transform hover:scale-105"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nenhum curso encontrado</h3>
            <p className="max-w-xs text-gray-500">Tente ajustar seus filtros ou buscar por outro termo.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("Todos"); }}
              className="mt-6 font-medium text-indigo-600 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CourseCard({ course }) {
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-violet-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
  ];
  const gradientIndex = course.id.charCodeAt(0) % gradients.length;

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Image or gradient fallback */}
      {course.image ? (
        <img
          src={course.image}
          alt={course.title}
          className="h-40 w-full rounded-t-2xl object-cover"
        />
      ) : (
        <div className={`h-40 w-full rounded-t-2xl bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center`}>
          <BookOpen size={40} className="text-white/80" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {course.category && (
          <span className="mb-2 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {course.category}
          </span>
        )}
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-gray-500">
          {course.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          {course.price != null ? (
            <span className="text-sm font-bold text-gray-900">
              R$ {course.price.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm font-medium text-emerald-600">Gratuito</span>
          )}
          <Link
            href={`/courses/${course.id}`}
            className="brand-gradient rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ver curso
          </Link>
        </div>
      </div>
    </div>
  );
}
