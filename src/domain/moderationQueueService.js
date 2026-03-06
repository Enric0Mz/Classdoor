import * as reviewRepository from "@/repositories/reviewRepository";
import { moderateComment } from "@/domain/moderationService";

/**
 * Processes reviews stuck in PENDING_MODERATION by re-running moderation.
 * Reviews that still fail (API down) stay as PENDING_MODERATION for the next cycle.
 *
 * @param {number} batchSize - Maximum number of reviews to process
 * @returns {Promise<{processed: number, succeeded: number, failed: number}>}
 */
export async function processPendingReviews(batchSize = 50) {
  const pendingReviews =
    await reviewRepository.findPendingModeration(batchSize);

  let succeeded = 0;
  let failed = 0;

  for (const review of pendingReviews) {
    try {
      const { moderationStatus, moderationReason } = await moderateComment(
        review.comment,
      );

      if (moderationStatus === "PENDING_MODERATION") {
        failed++;
        continue;
      }

      await reviewRepository.update(review.id, {
        moderationStatus,
        moderationReason,
      });
      succeeded++;
    } catch (error) {
      console.error(`Failed to process review ${review.id}:`, error.message);
      failed++;
    }
  }

  return {
    processed: pendingReviews.length,
    succeeded,
    failed,
  };
}
