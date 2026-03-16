-- CreateEnum
CREATE TYPE "ExternalReviewSource" AS ENUM ('GOOGLE_MAPS');

-- CreateTable
CREATE TABLE "ExternalReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "textSnippet" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "source" "ExternalReviewSource" NOT NULL DEFAULT 'GOOGLE_MAPS',
    "originalDate" TIMESTAMP(3) NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalReview_sourceUrl_key" ON "ExternalReview"("sourceUrl");

-- AddForeignKey
ALTER TABLE "ExternalReview" ADD CONSTRAINT "ExternalReview_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
