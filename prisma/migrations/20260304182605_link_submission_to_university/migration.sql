-- AlterTable
ALTER TABLE "UniversitySubmission" ADD COLUMN     "universityId" TEXT;

-- AddForeignKey
ALTER TABLE "UniversitySubmission" ADD CONSTRAINT "UniversitySubmission_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
