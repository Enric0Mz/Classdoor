import prisma from "@/lib/prisma";

/**
 * Finds a UniversityDomain record by domain string, including the related university.
 *
 * @param {string} domain - e.g. "usp.br"
 * @returns {object|null}
 */
export async function findByDomain(domain) {
  return prisma.universityDomain.findUnique({
    where: { domain },
    include: { university: true },
  });
}

/**
 * Creates a new UniversityDomain record linking a domain to a university.
 *
 * @param {string} domain - e.g. "usp.br"
 * @param {string} universityId - UUID of the university
 * @returns {object}
 */
export async function findManyByDomains(domains) {
  return prisma.universityDomain.findMany({
    where: { domain: { in: domains } },
  });
}

export async function create(domain, universityId) {
  return prisma.universityDomain.create({
    data: { domain, universityId },
  });
}

/**
 * Upserts a UniversityDomain record. Creates it if it doesn't exist, updates if it does.
 * Used by the seed script to avoid duplicate errors.
 *
 * @param {string} domain - e.g. "usp.br"
 * @param {string} universityId - UUID of the university
 * @returns {object}
 */
export async function upsert(domain, universityId) {
  return prisma.universityDomain.upsert({
    where: { domain },
    update: { universityId },
    create: { domain, universityId },
  });
}
