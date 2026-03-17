import prisma from "@/lib/prisma";

export async function createMany(dataArray) {
  return prisma.externalReview.createMany({
    data: dataArray,
    skipDuplicates: true,
  });
}

export async function findByUniversityId({ universityId, skip, take }) {
  const [data, total] = await prisma.$transaction([
    prisma.externalReview.findMany({
      where: { universityId },
      orderBy: { originalDate: "desc" },
      skip,
      take,
    }),
    prisma.externalReview.count({ where: { universityId } }),
  ]);
  return { data, total };
}

export async function getStatsByUniversityId(universityId) {
  const [aggregateResult, recommendedCount] = await prisma.$transaction([
    prisma.externalReview.aggregate({
      where: { universityId },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.externalReview.count({
      where: { universityId, rating: { gte: 4 } },
    }),
  ]);

  return {
    averageRating: aggregateResult._avg.rating
      ? +aggregateResult._avg.rating.toFixed(1)
      : null,
    reviewCount: aggregateResult._count.id,
    recommendedCount,
  };
}

export async function deleteByUniversityId(universityId) {
  return prisma.externalReview.deleteMany({ where: { universityId } });
}
