import crypto from "crypto";
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

  const reviewData = { rating, difficultyLevel, universityId, comment };

  if (authorId) {
    reviewData.authorId = authorId;
    const review = await reviewRepository.create(reviewData);
    return { review };
  }

  const editToken = crypto.randomUUID();
  reviewData.editToken = editToken;
  const review = await reviewRepository.create(reviewData);
  return { review, editToken };
}

export async function listReviews({ universityId } = {}) {
  return reviewRepository.findAll({ universityId });
}

export async function getReviewById(id) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  return review;
}

export async function updateReview(id, data, requesterId, editToken) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isOwner = review.authorId && review.authorId === requesterId;
  const hasValidEditToken = review.editToken && review.editToken === editToken;

  if (!isOwner && !hasValidEditToken) {
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

export async function deleteReview(id, requesterId, editToken) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const isOwner = review.authorId && review.authorId === requesterId;
  const hasValidEditToken = review.editToken && review.editToken === editToken;

  if (!isOwner && !hasValidEditToken) {
    throw new AppError("Forbidden", 403);
  }

  return reviewRepository.remove(id);
}
