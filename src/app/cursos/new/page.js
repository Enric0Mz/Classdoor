"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { translateError } from "@/lib/errorMessages";
import {
  fetchWithAuth,
  AuthExpiredError,
  isAuthenticated as checkAuth,
} from "@/lib/fetchWithAuth";

function getRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export default function NewCoursePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/login");
      return;
    }
    const token = localStorage.getItem("token");
    if (token) {
      const role = getRoleFromToken(token);
      if (role !== "ADMIN") {
        router.replace("/courses");
        return;
      }
    }
    setAuthorized(true);
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    if (!formData.description.trim()) {
      setError("A descrição é obrigatória.");
      return;
    }
    if (!formData.link.trim()) {
      setError("O link do curso é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        image: formData.image.trim() || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category.trim() || undefined,
      };

      const res = await fetchWithAuth("/api/v1/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          translateError(data.error?.message, "Erro ao criar curso."),
        );
      }

      router.push(`/courses/${data.id}`);
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        router.push("/login");
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pt-16">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-secondary"
        >
          <ArrowLeft size={16} />
          Voltar ao catálogo
        </Link>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-headline text-xl font-bold text-primary">
                Novo Curso
              </h1>
              <p className="text-sm text-on-surface-variant">
                Adicione um curso ao catálogo
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-on-surface-variant">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: JavaScript do Zero ao Avançado"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-on-surface-variant">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Descreva o conteúdo e benefícios do curso..."
                className="w-full resize-none rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-on-surface-variant">
                Link do curso <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://udemy.com/course/..."
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-on-surface-variant">
                URL da imagem (opcional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-on-surface-variant">
                  Preço (opcional)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-on-surface-variant">
                  Categoria (opcional)
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ex: Programação"
                  className="w-full rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-tertiary-fixed-dim py-3 text-sm font-bold text-primary transition-all hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Curso"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
