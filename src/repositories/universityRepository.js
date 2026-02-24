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
        include: { author: { select: REVIEW_AUTHOR_SELECT } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function findByName(name) {
  return prisma.university.findUnique({ where: { name } });
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
export async function findByEmailDomain(domain) {
  const universityDomain = await prisma.universityDomain.findUnique({
    where: { domain },
    include: { university: true },
  });

  return universityDomain?.university ?? null;
}
