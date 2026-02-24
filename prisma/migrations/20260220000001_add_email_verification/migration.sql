-- Add emailVerified flag to User
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Create EmailVerification table
CREATE TABLE "EmailVerification" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

ALTER TABLE "EmailVerification"
    ADD CONSTRAINT "EmailVerification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
