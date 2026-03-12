-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "parentReviewId" TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_parentReviewId_fkey" FOREIGN KEY ("parentReviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
