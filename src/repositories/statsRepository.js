import prisma from "@/lib/prisma";

export async function getPlatformStats() {
  const [universityCount, reviewCount, externalReviewCount, ratingResult] =
    await Promise.all([
      prisma.university.count(),
      prisma.review.count({
        where: { moderationStatus: "APPROVED", parentReviewId: null },
      }),
      prisma.externalReview.count(),
      prisma.university.aggregate({
        _avg: { rating: true },
        where: { rating: { not: null } },
      }),
    ]);

  return {
    universityCount,
    reviewCount: reviewCount + externalReviewCount,
    averageRating: ratingResult._avg.rating
      ? Number(ratingResult._avg.rating.toFixed(1))
      : 0,
  };
}
