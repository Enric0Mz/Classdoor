"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, Tag, DollarSign } from "lucide-react";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/v1/courses/${id}`);
        if (!res.ok) throw new Error("Curso não encontrado");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="skeleton mb-4 h-6 w-32 rounded" />
          <div className="skeleton mb-6 h-64 w-full rounded-2xl" />
          <div className="skeleton mb-4 h-8 w-3/4 rounded" />
          <div className="skeleton mb-2 h-4 w-full rounded" />
          <div className="skeleton mb-2 h-4 w-5/6 rounded" />
          <div className="skeleton mb-2 h-4 w-4/6 rounded" />
          <div className="mt-6 skeleton h-12 w-48 rounded-xl" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Link href="/courses" className="rounded-xl bg-white px-6 py-2 text-sm font-bold text-red-600 shadow-sm">
            Voltar ao catálogo
          </Link>
        </div>
      </main>
    );
  }

  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-violet-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
  ];
  const gradientIndex = course.id.charCodeAt(0) % gradients.length;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back button */}
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Voltar ao catálogo
        </Link>

        {/* Banner Image */}
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="mb-6 h-64 w-full rounded-2xl object-cover shadow-md"
          />
        ) : (
          <div className={`mb-6 flex h-64 w-full items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[gradientIndex]} shadow-md`}>
            <BookOpen size={64} className="text-white/80" />
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* Category badge */}
          {course.category && (
            <div className="mb-3 flex items-center gap-2">
              <Tag size={14} className="text-indigo-500" />
              <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-sm font-medium text-indigo-700">
                {course.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900">
            {course.title}
          </h1>

          {/* Description */}
          <p className="mb-6 leading-relaxed text-gray-600">{course.description}</p>

          {/* Price & CTA */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-gray-400" />
              {course.price != null ? (
                <span className="text-2xl font-bold text-gray-900">
                  R$ {course.price.toFixed(2)}
                </span>
              ) : (
                <span className="text-2xl font-bold text-emerald-600">Gratuito</span>
              )}
            </div>

            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
            >
              <ExternalLink size={18} />
              Acessar Curso
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
