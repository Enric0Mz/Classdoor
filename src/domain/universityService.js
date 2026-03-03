import { AppError } from "@/errors/AppError";
import * as universityRepository from "@/repositories/universityRepository";

const VALID_TYPES = ["PUBLIC", "PRIVATE"];

export async function createUniversity({
  name,
  location,
  website,
  image,
  type,
  courses,
  rating,
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

  return universityRepository.create({
    name,
    location,
    website,
    image,
    type,
    courses,
    rating,
  });
}

export async function listUniversities({ skip, take } = {}) {
  return universityRepository.findAll({ skip, take });
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
