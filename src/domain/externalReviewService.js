import * as externalReviewRepository from "@/repositories/externalReviewRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { AppError } from "@/errors/AppError";

function truncateAtWordBoundary(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const cutPoint = lastSpaceIndex > 0 ? lastSpaceIndex : maxLength;
  return truncated.slice(0, cutPoint) + "...";
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export async function importReviews(payload) {
  if (!Array.isArray(payload)) {
    throw new AppError("Payload must be an array", 400);
  }

  let importedCount = 0;
  const skippedUniversities = [];

  for (const entry of payload) {
    const { universityName, reviews } = entry;

    if (!universityName || !Array.isArray(reviews)) {
      continue;
    }

    const university = await universityRepository.findByName(universityName);

    if (!university) {
      skippedUniversities.push(universityName);
      continue;
    }

    const validReviews = reviews
      .filter((review) => isValidRating(review.rating) && review.url)
      .map((review) => ({
        rating: review.rating,
        textSnippet: truncateAtWordBoundary(review.text),
        sourceUrl: review.url,
        source: "GOOGLE_MAPS",
        originalDate: new Date(review.date || Date.now()),
        universityId: university.id,
      }));

    if (validReviews.length > 0) {
      const result = await externalReviewRepository.createMany(validReviews);
      importedCount += result.count;
    }
  }

  return {
    imported: importedCount,
    skippedUniversities,
  };
}

export async function listByUniversity({ universityId, skip, take }) {
  if (!universityId) {
    throw new AppError("universityId is required", 400);
  }
  return externalReviewRepository.findByUniversityId({
    universityId,
    skip,
    take,
  });
}

export async function getStats(universityId) {
  const stats =
    await externalReviewRepository.getStatsByUniversityId(universityId);

  if (stats.reviewCount === 0) {
    return null;
  }

  return {
    averageRating: stats.averageRating,
    reviewCount: stats.reviewCount,
    recommendedCount: stats.recommendedCount,
    source: "GOOGLE_MAPS",
  };
}
