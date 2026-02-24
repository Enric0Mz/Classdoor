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

/**
 * Computes the isVerified flag for a review.
 * A review is considered verified when the author's linked university
 * matches the university being reviewed.
 *
 * @param {object} review
 * @returns {boolean}
 */
function computeIsVerified(review) {
  return (
    review.author?.universityId !== null &&
    review.author?.universityId !== undefined &&
    review.author?.universityId === review.universityId
  );
}

/**
 * Adds the computed isVerified field to a review object.
 *
 * @param {object} review
 * @returns {object}
 */
function withIsVerified(review) {
  return { ...review, isVerified: computeIsVerified(review) };
}

export async function createReview(body, authorId) {
  const { rating, difficultyLevel, universityId, comment } = body;

  if (!universityId) {
    throw new AppError("universityId is required", 400);
  }

  validateRating(rating);
  validateDifficultyLevel(difficultyLevel);

  const review = await reviewRepository.create({ rating, difficultyLevel, universityId, comment, authorId });
  return { review: withIsVerified(review) };
}

export async function listReviews({ universityId, skip, take } = {}) {
  const { data, total } = await reviewRepository.findAll({ universityId, skip, take });
  return { data: data.map(withIsVerified), total };
}

export async function getReviewById(id) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  return withIsVerified(review);
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

  const updatedReview = await reviewRepository.update(id, updateData);
  return withIsVerified(updatedReview);
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
