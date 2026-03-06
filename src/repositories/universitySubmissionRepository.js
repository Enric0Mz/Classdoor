import prisma from "@/lib/prisma";

const SUBMITTER_SELECT = {
  id: true,
  username: true,
};

export async function create(data) {
  return prisma.universitySubmission.create({ data });
}

export async function findAll({ skip, take, status } = {}) {
  const where = status ? { status } : {};

  const [data, total] = await prisma.$transaction([
    prisma.universitySubmission.findMany({
      where,
      skip,
      take,
      include: { submitter: { select: SUBMITTER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.universitySubmission.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id) {
  return prisma.universitySubmission.findUnique({
    where: { id },
    include: { submitter: { select: SUBMITTER_SELECT } },
  });
}

export async function findBySubmitter(submitterId, { skip, take } = {}) {
  const where = { submitterId };

  const [data, total] = await prisma.$transaction([
    prisma.universitySubmission.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.universitySubmission.count({ where }),
  ]);

  return { data, total };
}

export async function findPendingByName(name) {
  return prisma.universitySubmission.findFirst({
    where: { name, status: "PENDING" },
  });
}

export async function updateStatus(
  id,
  { status, reason, reviewedBy, reviewedAt, universityId },
) {
  return prisma.universitySubmission.update({
    where: { id },
    data: { status, reason, reviewedBy, reviewedAt, universityId },
  });
}
