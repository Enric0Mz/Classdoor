import { AppError } from "@/errors/AppError";
import * as reviewRepository from "@/repositories/reviewRepository";

function validateRating(rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError("Rating must be an integer between 1 and 5", 400);
  }
}

function validateDifficultyLevel(difficultyLevel) {
  if (!Number.isInteger(difficultyLevel) || difficultyLevel < 1 || difficultyLevel > 5) {
    throw new AppError("Difficulty level must be an integer between 1 and 5", 400);
  }
}

export async function createReview(body, authorId) {
  const { rating, difficultyLevel, universityId, comment } = body;

  if (!universityId) {
    throw new AppError("universityId is required", 400);
  }

  validateRating(rating);
  validateDifficultyLevel(difficultyLevel);

  const review = await reviewRepository.create({ rating, difficultyLevel, universityId, comment, authorId });
  return { review };
}

export async function listReviews({ universityId, skip, take } = {}) {
  return reviewRepository.findAll({ universityId, skip, take });
}

export async function getReviewById(id) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  return review;
}

export async function updateReview(id, data, requesterId, requesterRole) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isAuthor = review.authorId === requesterId;
  const isAdminOrMod = ["ADMIN", "MODERATOR"].includes(requesterRole);

  if (!isAuthor && !isAdminOrMod) {
    throw new AppError("Forbidden", 403);
  }

  const { rating, difficultyLevel, comment } = data;
  const updateData = {};

  if (rating !== undefined) {
    validateRating(rating);
    updateData.rating = rating;
  }
  if (difficultyLevel !== undefined) {
    validateDifficultyLevel(difficultyLevel);
    updateData.difficultyLevel = difficultyLevel;
  }
  if (comment !== undefined) {
    updateData.comment = comment;
  }

  return reviewRepository.update(id, updateData);
}

export async function deleteReview(id, requesterId, requesterRole) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isAuthor = review.authorId === requesterId;
  const isAdminOrMod = ["ADMIN", "MODERATOR"].includes(requesterRole);

  if (!isAuthor && !isAdminOrMod) {
    throw new AppError("Forbidden", 403);
  }

  return reviewRepository.remove(id);
}
