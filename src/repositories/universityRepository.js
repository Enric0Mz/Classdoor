import prisma from "@/lib/prisma";

const REVIEW_AUTHOR_SELECT = {
  id: true,
  username: true,
  verified: true,
};

export async function findAll({ skip, take } = {}) {
  const [data, total] = await prisma.$transaction([
    prisma.university.findMany({ skip, take }),
    prisma.university.count(),
  ]);
  return { data, total };
}

export async function findById(id) {
  return prisma.university.findUnique({
    where: { id },
    include: {
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

export async function create(data) {
  return prisma.university.create({ data });
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
    await tx.universityDomain.deleteMany({ where: { universityId: id } });
    await tx.user.updateMany({
      where: { universityId: id },
      data: { universityId: null },
    });
    return tx.university.delete({ where: { id } });
  });
}

export async function createManyWithDomains(universitiesData) {
  const universityFields = universitiesData.map(
    ({ domain, ...fields }) => fields,
  );
  const names = universitiesData.map((university) => university.name);

  return prisma.$transaction(
    async (tx) => {
      await tx.university.createMany({ data: universityFields });

      const createdUniversities = await tx.university.findMany({
        where: { name: { in: names } },
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
