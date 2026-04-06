"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, Tag } from "lucide-react";

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
      <main className="flex min-h-screen flex-col bg-background pt-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <div className="skeleton mb-4 h-6 w-32 rounded" />
          <div className="skeleton mb-6 h-64 w-full rounded-2xl" />
          <div className="skeleton mb-4 h-8 w-3/4 rounded" />
          <div className="skeleton mb-2 h-4 w-full rounded" />
          <div className="skeleton mb-2 h-4 w-5/6 rounded" />
          <div className="skeleton mt-6 h-12 w-48 rounded-xl" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col bg-background pt-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Link
            href="/courses"
            className="rounded-xl bg-surface-container-lowest px-6 py-2 text-sm font-bold text-red-600 shadow-sm"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </main>
    );
  }

  const gradients = [
    "from-primary to-primary-container",
    "from-primary-container to-primary",
    "from-secondary-container to-primary",
    "from-primary to-secondary-container",
    "from-primary-container to-secondary-container",
  ];
  const gradientIndex = course.id.charCodeAt(0) % gradients.length;

  return (
    <main className="flex min-h-screen flex-col bg-background pt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {/* Back button */}
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-secondary"
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
          <div
            className={`mb-6 flex h-64 w-full items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[gradientIndex]} shadow-md`}
          >
            <BookOpen size={64} className="text-white/60" />
          </div>
        )}

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
          {/* Category badge */}
          {course.category && (
            <div className="mb-3 flex items-center gap-2">
              <Tag size={14} className="text-secondary" />
              <span className="rounded-full bg-secondary-fixed px-3 py-0.5 text-sm font-medium text-on-secondary-container">
                {course.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-headline mb-4 text-3xl font-bold tracking-tight text-primary">
            {course.title}
          </h1>

          {/* Description */}
          <p className="mb-6 leading-relaxed text-on-surface-variant">
            {course.description}
          </p>

          {/* Price & CTA */}
          <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {course.price != null ? (
                <span className="font-headline text-2xl font-bold text-primary">
                  R$ {course.price.toFixed(2)}
                </span>
              ) : (
                <span className="font-headline text-2xl font-bold text-tertiary-fixed-dim">
                  Gratuito
                </span>
              )}
            </div>

            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim px-8 py-3 text-base font-bold text-primary transition-all hover:brightness-110"
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
