-- DropForeignKey
ALTER TABLE "UniversityDomain" DROP CONSTRAINT "UniversityDomain_universityId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_universityId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_authorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_universityId_fkey";

-- DropForeignKey
ALTER TABLE "EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityEmailVerification" DROP CONSTRAINT "UniversityEmailVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "UniversitySubmission" DROP CONSTRAINT "UniversitySubmission_universityId_fkey";

-- DropForeignKey
ALTER TABLE "UniversitySubmission" DROP CONSTRAINT "UniversitySubmission_submitterId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalReview" DROP CONSTRAINT "ExternalReview_universityId_fkey";

-- DropForeignKey
ALTER TABLE "UniversityImage" DROP CONSTRAINT "UniversityImage_universityId_fkey";

-- AddForeignKey (UniversityDomain -> University: CASCADE)
ALTER TABLE "UniversityDomain" ADD CONSTRAINT "UniversityDomain_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (Review -> University: CASCADE)
ALTER TABLE "Review" ADD CONSTRAINT "Review_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (Review -> User: SET NULL)
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey (User -> University: SET NULL)
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey (EmailVerification -> User: CASCADE)
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (UniversityEmailVerification -> User: CASCADE)
ALTER TABLE "UniversityEmailVerification" ADD CONSTRAINT "UniversityEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (UniversitySubmission -> University: SET NULL)
ALTER TABLE "UniversitySubmission" ADD CONSTRAINT "UniversitySubmission_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey (UniversitySubmission -> User: CASCADE)
ALTER TABLE "UniversitySubmission" ADD CONSTRAINT "UniversitySubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (ExternalReview -> University: CASCADE)
ALTER TABLE "ExternalReview" ADD CONSTRAINT "ExternalReview_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (UniversityImage -> University: CASCADE)
ALTER TABLE "UniversityImage" ADD CONSTRAINT "UniversityImage_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
