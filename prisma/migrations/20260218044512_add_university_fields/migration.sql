/*
  Warnings:

  - Added the required column `type` to the `University` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UniversityType" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "courses" TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "type" "UniversityType" NOT NULL DEFAULT 'PUBLIC';
