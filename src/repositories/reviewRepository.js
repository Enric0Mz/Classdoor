import prisma from "@/lib/prisma";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  verified: true,
  universityId: true,
};

export async function create(data) {
  return prisma.review.create({
    data,
    include: { author: { select: AUTHOR_SELECT } },
  });
}

export async function findAll({ universityId, skip, take } = {}) {
  const where = {
    moderationStatus: "APPROVED",
    NOT: { childReviews: { some: { moderationStatus: "APPROVED" } } },
  };
  if (universityId) {
    where.universityId = universityId;
  }
  const [data, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);
  return { data, total };
}

export async function findById(id) {
  return prisma.review.findUnique({
    where: { id },
    include: { author: { select: AUTHOR_SELECT } },
  });
}

export async function update(id, data) {
  return prisma.review.update({
    where: { id },
    data,
    include: { author: { select: AUTHOR_SELECT } },
  });
}

export async function findByAuthorId({ authorId, skip, take } = {}) {
  const where = { authorId, parentReviewId: null };
  const [data, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      include: {
        author: { select: AUTHOR_SELECT },
        university: { select: { id: true, name: true } },
        childReviews: {
          include: { author: { select: AUTHOR_SELECT } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);
  return { data, total };
}

export async function findPendingModeration(limit = 50) {
  return prisma.review.findMany({
    where: { moderationStatus: "PENDING_MODERATION" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function remove(id) {
  return prisma.review.delete({ where: { id } });
}
