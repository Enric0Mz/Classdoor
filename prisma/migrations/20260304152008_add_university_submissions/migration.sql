-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "UniversitySubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" "UniversityType" NOT NULL,
    "website" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "submitterId" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversitySubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UniversitySubmission" ADD CONSTRAINT "UniversitySubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
