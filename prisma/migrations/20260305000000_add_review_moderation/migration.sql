-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('APPROVED', 'REJECTED_OFFENSIVE', 'REJECTED_NONSENSE', 'REJECTED_OTHER');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Review" ADD COLUMN "moderationReason" TEXT;
