-- Step 1: Make email and password nullable on User
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- Step 2: Add username column with a temporary default so existing rows get a value
ALTER TABLE "User" ADD COLUMN "username" TEXT;
UPDATE "User" SET "username" = 'user_' || substr(id::text, 1, 8) WHERE "username" IS NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Step 3: Add unique constraint on username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Step 4: Add universityEmail and verified columns
ALTER TABLE "User" ADD COLUMN "universityEmail" TEXT;
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "User_universityEmail_key" ON "User"("universityEmail");

-- Step 5: Add authorId and editToken to Review
ALTER TABLE "Review" ADD COLUMN "authorId" TEXT;
ALTER TABLE "Review" ADD COLUMN "editToken" TEXT;
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Create UniversityEmailVerification model
CREATE TABLE "UniversityEmailVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityEmailVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UniversityEmailVerification_token_key" ON "UniversityEmailVerification"("token");
ALTER TABLE "UniversityEmailVerification" ADD CONSTRAINT "UniversityEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
