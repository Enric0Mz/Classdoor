import { AppError } from "@/errors/AppError";
import { sanitizeString } from "@/lib/sanitize";
import * as universityRepository from "@/repositories/universityRepository";
import * as universityDomainRepository from "@/repositories/universityDomainRepository";
import * as universitySubmissionRepository from "@/repositories/universitySubmissionRepository";

const VALID_TYPES = ["PUBLIC", "PRIVATE"];

export async function createSubmission(
  { name, location, type, website, emailDomain },
  submitterId,
) {
  const sanitizedName = sanitizeString(name);
  const sanitizedLocation = location ? sanitizeString(location) : undefined;
  const sanitizedWebsite = website ? sanitizeString(website) : undefined;
  const sanitizedEmailDomain = emailDomain
    ? sanitizeString(emailDomain)
    : undefined;

  if (!sanitizedName) {
    throw new AppError("Name is required", 400);
  }

  if (!type) {
    throw new AppError("Type is required", 400);
  }

  if (!VALID_TYPES.includes(type)) {
    throw new AppError("Type must be PUBLIC or PRIVATE", 400);
  }

  const existingUniversity =
    await universityRepository.findByName(sanitizedName);
  if (existingUniversity) {
    throw new AppError("A university with this name already exists", 409);
  }

  const pendingSubmission =
    await universitySubmissionRepository.findPendingByName(sanitizedName);
  if (pendingSubmission) {
    throw new AppError(
      "A submission with this name is already pending review",
      409,
    );
  }

  return universitySubmissionRepository.create({
    name: sanitizedName,
    location: sanitizedLocation,
    type,
    website: sanitizedWebsite,
    emailDomain: sanitizedEmailDomain,
    submitterId,
  });
}

export async function listSubmissions({ skip, take, status } = {}) {
  return universitySubmissionRepository.findAll({ skip, take, status });
}

export async function getSubmissionById(id) {
  const submission = await universitySubmissionRepository.findById(id);

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  return submission;
}

export async function listSubmissionsByUser(submitterId, { skip, take } = {}) {
  return universitySubmissionRepository.findBySubmitter(submitterId, {
    skip,
    take,
  });
}

export async function approveSubmission(
  submissionId,
  adminId,
  { universityId, emailDomain } = {},
) {
  const submission =
    await universitySubmissionRepository.findById(submissionId);

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  if (submission.status !== "PENDING") {
    throw new AppError("Only pending submissions can be approved", 400);
  }

  const approvedSubmission = await universitySubmissionRepository.updateStatus(
    submissionId,
    {
      status: "APPROVED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      universityId: universityId || undefined,
    },
  );

  const domainToCreate = emailDomain || submission.emailDomain;
  if (domainToCreate && universityId) {
    const existingDomain =
      await universityDomainRepository.findByDomain(domainToCreate);
    if (existingDomain) {
      throw new AppError(
        "This email domain is already associated with another university",
        409,
      );
    }
    await universityDomainRepository.create(domainToCreate, universityId);
  }

  return approvedSubmission;
}

export async function rejectSubmission(submissionId, adminId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError("Reason is required for rejection", 400);
  }

  const submission =
    await universitySubmissionRepository.findById(submissionId);

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  if (submission.status !== "PENDING") {
    throw new AppError("Only pending submissions can be rejected", 400);
  }

  return universitySubmissionRepository.updateStatus(submissionId, {
    status: "REJECTED",
    reason: sanitizeString(reason),
    reviewedBy: adminId,
    reviewedAt: new Date(),
  });
}
