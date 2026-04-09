import { notFound, redirect } from "next/navigation";
import * as universityService from "@/domain/universityService";
import * as reviewService from "@/domain/reviewService";
import * as externalReviewService from "@/domain/externalReviewService";
import { paginatedResponse } from "@/lib/pagination";
import JsonLd from "@/components/JsonLd";
import { buildUniversitySchema, buildBreadcrumbSchema } from "@/lib/jsonLd";
import UniversityDetailClient from "./UniversityDetailClient";

const REVIEWS_PER_PAGE = 10;

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const university = await universityService.getUniversityById(id);

    // If slug exists, the canonical is at /universidades/[slug]
    if (university.slug) {
      return {};
    }

    const reviewCount = university.stats?.reviewCount ?? 0;
    const avgRating = university.stats?.averageRating;

    const ratingText = avgRating ? `Nota ${avgRating}/5.` : "";
    const reviewText =
      reviewCount > 0
        ? `${reviewCount} ${reviewCount === 1 ? "avaliação" : "avaliações"} de alunos.`
        : "";

    return {
      title: `${university.name} — Avaliações e Nota`,
      description:
        `Veja avaliações reais de alunos da ${university.name}. ${ratingText} ${reviewText} ${university.location}.`.trim(),
      openGraph: {
        title: `${university.name} — Avaliações | InfoCampus`,
        description:
          `${ratingText} ${reviewText} Compare com outras universidades no InfoCampus.`.trim(),
        images: university.images?.[0]?.url
          ? [{ url: university.images[0].url }]
          : [],
      },
    };
  } catch {
    return {
      title: "Universidade não encontrada",
    };
  }
}

export default async function UniversityDetailPage({ params }) {
  const { id } = await params;

  let university;
  try {
    university = await universityService.getUniversityById(id);
  } catch {
    notFound();
  }

  // Redirect to slug-based URL if available
  if (university.slug) {
    redirect(`/universidades/${university.slug}`);
  }

  // Fallback: render detail page directly when no slug exists
  const [reviewsResult, externalReviewsResult] = await Promise.all([
    reviewService
      .listReviews({ universityId: id, skip: 0, take: REVIEWS_PER_PAGE })
      .catch(() => ({ data: [], total: 0 })),
    externalReviewService
      .listByUniversity({ universityId: id, skip: 0, take: REVIEWS_PER_PAGE })
      .catch(() => ({ data: [], total: 0 })),
  ]);

  const reviewsPagination = paginatedResponse(
    reviewsResult.data,
    reviewsResult.total,
    1,
    REVIEWS_PER_PAGE,
  ).pagination;

  const externalReviewsPagination = paginatedResponse(
    externalReviewsResult.data,
    externalReviewsResult.total,
    1,
    REVIEWS_PER_PAGE,
  ).pagination;

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Início", url: "/" },
    { name: university.name },
  ]);

  return (
    <>
      <JsonLd data={buildUniversitySchema(university)} />
      <JsonLd data={breadcrumbs} />
      <UniversityDetailClient
        initialUniversity={university}
        initialReviews={reviewsResult.data}
        initialReviewsPagination={reviewsPagination}
        initialExternalReviews={externalReviewsResult.data}
        initialExternalReviewsPagination={externalReviewsPagination}
      />
    </>
  );
}
