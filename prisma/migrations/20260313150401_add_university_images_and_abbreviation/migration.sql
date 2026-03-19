/*
  Warnings:

  - You are about to drop the column `image` on the `University` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "University" DROP COLUMN "image",
ADD COLUMN     "abbreviation" TEXT;

-- CreateTable
CREATE TABLE "UniversityImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UniversityImage" ADD CONSTRAINT "UniversityImage_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
