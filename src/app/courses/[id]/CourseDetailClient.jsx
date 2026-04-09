"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, ExternalLink, Tag } from "lucide-react";

export default function CourseDetailClient({ course }) {
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
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-2xl shadow-md">
            <Image
              src={course.image}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
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
