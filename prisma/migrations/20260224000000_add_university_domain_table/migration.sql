-- Add universityId to User
ALTER TABLE "User" ADD COLUMN "universityId" TEXT;

-- Create UniversityDomain table
CREATE TABLE "UniversityDomain" (
    "id"           TEXT NOT NULL,
    "domain"       TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityDomain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UniversityDomain_domain_key" ON "UniversityDomain"("domain");

ALTER TABLE "UniversityDomain"
    ADD CONSTRAINT "UniversityDomain_universityId_fkey"
    FOREIGN KEY ("universityId") REFERENCES "University"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User"
    ADD CONSTRAINT "User_universityId_fkey"
    FOREIGN KEY ("universityId") REFERENCES "University"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
