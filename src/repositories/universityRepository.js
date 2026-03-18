import prisma from "@/lib/prisma";

const REVIEW_AUTHOR_SELECT = {
  id: true,
  username: true,
  verified: true,
};

export async function findAll({ skip, take, where } = {}) {
  const [data, total] = await prisma.$transaction([
    prisma.university.findMany({
      where,
      include: {
        images: true,
        reviews: {
          where: {
            moderationStatus: "APPROVED",
            NOT: {
              childReviews: { some: { moderationStatus: "APPROVED" } },
            },
          },
          select: { rating: true },
        },
        externalReviews: {
          select: { rating: true },
        },
      },
      skip,
      take,
    }),
    prisma.university.count({ where }),
  ]);
  return { data, total };
}

export async function findAllOrderedByReviewCount({
  skip = 0,
  take = 10,
  search,
  type,
  state,
} = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      `(u."name" ILIKE $${paramIndex} OR u."abbreviation" ILIKE $${paramIndex} OR u."location" ILIKE $${paramIndex} OR $${paramIndex + 1} = ANY(u."courses"))`,
    );
    params.push(searchTerm, search.trim());
    paramIndex += 2;
  }

  if (type) {
    conditions.push(`u."type"::text = $${paramIndex}`);
    params.push(type);
    paramIndex += 1;
  }

  if (state) {
    conditions.push(`u."location" ILIKE $${paramIndex}`);
    params.push(`%${state}%`);
    paramIndex += 1;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM "University" u ${whereClause}`;
  const countResult = await prisma.$queryRawUnsafe(countQuery, ...params);
  const total = Number(countResult[0].count);

  const dataQuery = `
    SELECT
      u."id",
      u."name",
      u."abbreviation",
      u."location",
      u."website",
      u."type",
      u."courses",
      u."rating",
      u."createdAt",
      COALESCE(r.review_count, 0) + COALESCE(er.external_review_count, 0) AS "totalReviewCount",
      COALESCE(r.avg_rating, 0) AS "avgInternalRating",
      COALESCE(er.avg_rating, 0) AS "avgExternalRating",
      COALESCE(r.review_count, 0) AS "internalReviewCount",
      COALESCE(er.external_review_count, 0) AS "externalReviewCount"
    FROM "University" u
    LEFT JOIN (
      SELECT
        rev."universityId",
        COUNT(*) AS review_count,
        AVG(rev."rating") AS avg_rating
      FROM "Review" rev
      WHERE rev."moderationStatus" = 'APPROVED'
        AND NOT EXISTS (
          SELECT 1 FROM "Review" child
          WHERE child."parentReviewId" = rev."id"
            AND child."moderationStatus" = 'APPROVED'
        )
      GROUP BY rev."universityId"
    ) r ON r."universityId" = u."id"
    LEFT JOIN (
      SELECT
        er."universityId",
        COUNT(*) AS external_review_count,
        AVG(er."rating") AS avg_rating
      FROM "ExternalReview" er
      GROUP BY er."universityId"
    ) er ON er."universityId" = u."id"
    ${whereClause}
    ORDER BY "totalReviewCount" DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const data = await prisma.$queryRawUnsafe(dataQuery, ...params, take, skip);

  const universityIds = data.map((row) => row.id);
  const images = await prisma.universityImage.findMany({
    where: { universityId: { in: universityIds } },
  });
  const imagesByUniversityId = images.reduce((map, image) => {
    if (!map[image.universityId]) map[image.universityId] = [];
    map[image.universityId].push(image);
    return map;
  }, {});

  const enrichedData = data.map((row) => {
    const totalReviewCount = Number(row.totalReviewCount);
    const internalReviewCount = Number(row.internalReviewCount);
    const externalReviewCount = Number(row.externalReviewCount);
    const avgInternalRating = Number(row.avgInternalRating);
    const avgExternalRating = Number(row.avgExternalRating);

    const weightedRatingSum =
      avgInternalRating * internalReviewCount +
      avgExternalRating * externalReviewCount;
    const computedRating =
      totalReviewCount > 0
        ? +(weightedRatingSum / totalReviewCount).toFixed(1)
        : null;

    return {
      id: row.id,
      name: row.name,
      abbreviation: row.abbreviation,
      location: row.location,
      website: row.website,
      type: row.type,
      courses: row.courses,
      rating: computedRating,
      createdAt: row.createdAt,
      images: imagesByUniversityId[row.id] || [],
      reviewCount: totalReviewCount,
    };
  });

  return { data: enrichedData, total };
}

export async function findById(id) {
  return prisma.university.findUnique({
    where: { id },
    include: {
      images: true,
      reviews: {
        where: {
          moderationStatus: "APPROVED",
          NOT: { childReviews: { some: { moderationStatus: "APPROVED" } } },
        },
        include: { author: { select: REVIEW_AUTHOR_SELECT } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function findByName(name) {
  return prisma.university.findUnique({ where: { name } });
}

export async function findManyByNames(names) {
  return prisma.university.findMany({ where: { name: { in: names } } });
}

export async function create({ images, ...data }) {
  return prisma.university.create({
    data: {
      ...data,
      images:
        images && images.length > 0
          ? { create: images.map((url) => ({ url })) }
          : undefined,
    },
    include: { images: true },
  });
}

/**
 * Finds a university by matching an email domain via the UniversityDomain table.
 *
 * @param {string} domain - e.g. "usp.br"
 * @returns {object|null} The University record or null if not found
 */
export async function remove(id) {
  return prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { universityId: id } });
    await tx.externalReview.deleteMany({ where: { universityId: id } });
    await tx.universityDomain.deleteMany({ where: { universityId: id } });
    await tx.universityImage.deleteMany({ where: { universityId: id } });
    await tx.user.updateMany({
      where: { universityId: id },
      data: { universityId: null },
    });
    return tx.university.delete({ where: { id } });
  });
}

export async function createManyWithDomains(universitiesData) {
  const universityFields = universitiesData.map(
    ({ domain, images, ...fields }) => fields,
  );
  const names = universitiesData.map((university) => university.name);

  return prisma.$transaction(
    async (tx) => {
      await tx.university.createMany({ data: universityFields });

      const createdUniversities = await tx.university.findMany({
        where: { name: { in: names } },
        include: { images: true },
      });

      const universityNameToIdMap = new Map(
        createdUniversities.map((university) => [
          university.name,
          university.id,
        ]),
      );

      const domainRecords = universitiesData
        .filter((university) => university.domain)
        .map((university) => ({
          domain: university.domain,
          universityId: universityNameToIdMap.get(university.name),
        }));

      if (domainRecords.length > 0) {
        await tx.universityDomain.createMany({ data: domainRecords });
      }

      const imageRecords = universitiesData
        .filter(
          (university) => university.images && university.images.length > 0,
        )
        .flatMap((university) =>
          university.images.map((url) => ({
            url,
            universityId: universityNameToIdMap.get(university.name),
          })),
        );

      if (imageRecords.length > 0) {
        await tx.universityImage.createMany({ data: imageRecords });
      }

      return createdUniversities;
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

export async function findByEmailDomain(domain) {
  const universityDomain = await prisma.universityDomain.findUnique({
    where: { domain },
    include: { university: true },
  });

  return universityDomain?.university ?? null;
}
