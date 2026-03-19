-- CreateIndex
CREATE INDEX "Review_universityId_createdAt_idx" ON "Review"("universityId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_moderationStatus_createdAt_idx" ON "Review"("moderationStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE INDEX "UniversityDomain_universityId_idx" ON "UniversityDomain"("universityId");

-- CreateIndex
CREATE INDEX "User_universityId_idx" ON "User"("universityId");

-- CreateIndex
CREATE INDEX "EmailVerification_userId_idx" ON "EmailVerification"("userId");

-- CreateIndex
CREATE INDEX "UniversityEmailVerification_userId_idx" ON "UniversityEmailVerification"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_createdAt_idx" ON "RefreshToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UniversitySubmission_submitterId_idx" ON "UniversitySubmission"("submitterId");

-- CreateIndex
CREATE INDEX "UniversitySubmission_status_createdAt_idx" ON "UniversitySubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "UniversitySubmission_name_status_idx" ON "UniversitySubmission"("name", "status");

-- CreateIndex
CREATE INDEX "Course_active_category_idx" ON "Course"("active", "category");

-- CreateIndex
CREATE INDEX "Course_createdAt_idx" ON "Course"("createdAt");

-- CreateIndex
CREATE INDEX "ExternalReview_universityId_idx" ON "ExternalReview"("universityId");

-- CreateIndex
CREATE INDEX "UniversityImage_universityId_idx" ON "UniversityImage"("universityId");
