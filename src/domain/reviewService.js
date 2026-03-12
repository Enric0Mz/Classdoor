import { AppError } from "@/errors/AppError";
import * as reviewRepository from "@/repositories/reviewRepository";
import { sanitizeString } from "@/lib/sanitize";
import { moderateComment } from "@/domain/moderationService";

function validateRating(rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError("Rating must be an integer between 1 and 5", 400);
  }
}

function validateDifficultyLevel(difficultyLevel) {
  if (
    !Number.isInteger(difficultyLevel) ||
    difficultyLevel < 1 ||
    difficultyLevel > 5
  ) {
    throw new AppError(
      "Difficulty level must be an integer between 1 and 5",
      400,
    );
  }
}

const COMMENT_MIN_LENGTH = 10;
const COMMENT_MAX_LENGTH = 2000;

function validateComment(comment) {
  if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
    throw new AppError("comment is required", 400);
  }
  if (comment.trim().length < COMMENT_MIN_LENGTH) {
    throw new AppError(
      `comment must be at least ${COMMENT_MIN_LENGTH} characters`,
      400,
    );
  }
  if (comment.trim().length > COMMENT_MAX_LENGTH) {
    throw new AppError(
      `comment must be at most ${COMMENT_MAX_LENGTH} characters`,
      400,
    );
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

  // Sanitize first so validation runs against the value that will actually be stored.
  // This prevents inputs like "<script>x</script>" from passing length checks
  // before being stripped down to an empty/short string.
  const sanitizedComment = sanitizeString(comment);
  validateComment(sanitizedComment);

  const { moderationStatus, moderationReason } =
    await moderateComment(sanitizedComment);

  const review = await reviewRepository.create({
    rating,
    difficultyLevel,
    universityId,
    comment: sanitizedComment,
    authorId,
    moderationStatus,
    moderationReason,
  });

  const result = { review: withIsVerified(review) };

  if (moderationStatus === "PENDING_MODERATION") {
    result.moderation = {
      status: "PENDING_MODERATION",
      reason: "Sua avaliação foi recebida e será publicada em breve.",
    };
  } else if (moderationStatus !== "APPROVED") {
    result.moderation = {
      status: moderationStatus,
      reason: moderationReason,
    };
  }

  return result;
}

export async function listReviews({ universityId, skip, take } = {}) {
  const { data, total } = await reviewRepository.findAll({
    universityId,
    skip,
    take,
  });
  return { data: data.map(withIsVerified), total };
}

export async function listReviewsByAuthor({ authorId, skip, take } = {}) {
  const { data, total } = await reviewRepository.findByAuthorId({
    authorId,
    skip,
    take,
  });
  return { data: data.map(withIsVerified), total };
}

export async function getReviewById(id) {
  const review = await reviewRepository.findById(id);
  if (!review || review.moderationStatus !== "APPROVED") {
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
    const sanitizedComment = sanitizeString(comment);
    validateComment(sanitizedComment);
    updateData.comment = sanitizedComment;

    const { moderationStatus, moderationReason } =
      await moderateComment(sanitizedComment);
    updateData.moderationStatus = moderationStatus;
    updateData.moderationReason = moderationReason;
    console.log("MOD Status", moderationStatus);
  }

  const updatedReview = await reviewRepository.update(id, updateData);
  const result = withIsVerified(updatedReview);

  if (updateData.moderationStatus === "PENDING_MODERATION") {
    return {
      ...result,
      moderation: {
        status: "PENDING_MODERATION",
        reason: "Sua avaliação foi recebida e será publicada em breve.",
      },
    };
  }

  if (
    updateData.moderationStatus &&
    updateData.moderationStatus !== "APPROVED"
  ) {
    return {
      ...result,
      moderation: {
        status: updateData.moderationStatus,
        reason: updateData.moderationReason,
      },
    };
  }

  return result;
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
