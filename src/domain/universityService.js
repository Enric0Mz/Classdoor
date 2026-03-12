import { AppError } from "@/errors/AppError";
import * as universityRepository from "@/repositories/universityRepository";
import * as universityDomainRepository from "@/repositories/universityDomainRepository";

const VALID_TYPES = ["PUBLIC", "PRIVATE"];

export async function createUniversity({
  name,
  location,
  website,
  image,
  type,
  courses,
  rating,
  domain,
}) {
  if (!name) {
    throw new AppError("Name is required", 400);
  }

  if (!location) {
    throw new AppError("Location is required", 400);
  }

  if (!type) {
    throw new AppError("Type is required", 400);
  }

  if (!VALID_TYPES.includes(type)) {
    throw new AppError("Type must be PUBLIC or PRIVATE", 400);
  }

  const existing = await universityRepository.findByName(name);
  if (existing) {
    throw new AppError("A university with this name already exists", 409);
  }

  if (domain) {
    const existingDomain =
      await universityDomainRepository.findByDomain(domain);
    if (existingDomain) {
      throw new AppError(
        "This domain is already linked to another university",
        409,
      );
    }
  }

  const university = await universityRepository.create({
    name,
    location,
    website,
    image,
    type,
    courses,
    rating,
  });

  if (domain) {
    await universityDomainRepository.create(domain, university.id);
  }

  return university;
}

export async function bulkCreateUniversities(universities) {
  if (!Array.isArray(universities) || universities.length === 0) {
    throw new AppError("Request body must be a non-empty array", 400);
  }

  const validatedUniversities = [];

  for (const [index, university] of universities.entries()) {
    const { name, location, website, image, type, courses, rating, domain } =
      university;

    if (!name) {
      throw new AppError(`Item ${index}: Name is required`, 400);
    }

    if (!location) {
      throw new AppError(`Item ${index}: Location is required`, 400);
    }

    if (!type) {
      throw new AppError(`Item ${index}: Type is required`, 400);
    }

    if (!VALID_TYPES.includes(type)) {
      throw new AppError(`Item ${index}: Type must be PUBLIC or PRIVATE`, 400);
    }

    validatedUniversities.push({
      name,
      location,
      website,
      image,
      type,
      courses,
      rating,
      domain,
    });
  }

  const seenNames = new Set();
  const uniqueUniversities = validatedUniversities.filter((university) => {
    if (seenNames.has(university.name)) return false;
    seenNames.add(university.name);
    return true;
  });

  const names = uniqueUniversities.map((university) => university.name);
  const existingUniversities =
    await universityRepository.findManyByNames(names);
  const existingNameSet = new Set(
    existingUniversities.map((university) => university.name),
  );

  const skippedNames = uniqueUniversities
    .filter((university) => existingNameSet.has(university.name))
    .map((university) => university.name);

  const newUniversities = uniqueUniversities.filter(
    (university) => !existingNameSet.has(university.name),
  );

  if (newUniversities.length === 0) {
    return { created: 0, skipped: { names: skippedNames } };
  }

  const domains = newUniversities
    .filter((university) => university.domain)
    .map((university) => university.domain);

  const seenDomains = new Set();
  const deduplicatedUniversities = newUniversities.map((university) => {
    if (!university.domain || seenDomains.has(university.domain)) {
      return { ...university, domain: undefined };
    }
    seenDomains.add(university.domain);
    return university;
  });

  if (domains.length > 0) {
    const uniqueDomains = [...new Set(domains)];
    const existingDomains =
      await universityDomainRepository.findManyByDomains(uniqueDomains);
    const existingDomainSet = new Set(
      existingDomains.map((domainRecord) => domainRecord.domain),
    );

    for (const university of deduplicatedUniversities) {
      if (university.domain && existingDomainSet.has(university.domain)) {
        university.domain = undefined;
      }
    }
  }

  const createdUniversities = await universityRepository.createManyWithDomains(
    deduplicatedUniversities,
  );
  return {
    created: createdUniversities.length,
    skipped: { names: skippedNames },
  };
}

export async function listUniversities({ skip, take, search } = {}) {
  const { data, total } = await universityRepository.findAll({
    skip,
    take,
    search,
  });
  const enriched = data
    .map((university) => {
      const approvedReviews = university.reviews || [];
      const reviewCount = approvedReviews.length;
      const computedRating =
        reviewCount > 0
          ? +(
              approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
              reviewCount
            ).toFixed(1)
          : null;
      const { reviews, ...rest } = university;
      return { ...rest, reviewCount, rating: computedRating };
    })
    .sort((a, b) => b.reviewCount - a.reviewCount);
  return { data: enriched, total };
}

function computeStats(reviews) {
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    return {
      averageRating: null,
      averageDifficultyLevel: null,
      recommendationPercentage: null,
      reviewCount: 0,
    };
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
  const averageDifficultyLevel =
    reviews.reduce((sum, review) => sum + review.difficultyLevel, 0) /
    reviewCount;
  const recommendedCount = reviews.filter(
    (review) => review.rating >= 4,
  ).length;
  const recommendationPercentage = Math.round(
    (recommendedCount / reviewCount) * 100,
  );

  return {
    averageRating: +averageRating.toFixed(1),
    averageDifficultyLevel: +averageDifficultyLevel.toFixed(1),
    recommendationPercentage,
    reviewCount,
  };
}

export async function deleteUniversity(id) {
  const university = await universityRepository.findById(id);
  if (!university) {
    throw new AppError("University not found", 404);
  }
  return universityRepository.remove(id);
}

export async function getUniversityById(id) {
  const university = await universityRepository.findById(id);

  if (!university) {
    throw new AppError("University not found", 404);
  }

  const { reviews, ...universityData } = university;

  return {
    ...universityData,
    stats: computeStats(reviews),
  };
}
