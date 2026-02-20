import prisma from "@/lib/prisma";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  verified: true,
};

export async function create(data) {
  return prisma.review.create({
    data,
    include: { author: { select: AUTHOR_SELECT } },
  });
}

export async function findAll({ universityId, skip, take } = {}) {
  const where = universityId ? { universityId } : {};
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

export async function remove(id) {
  return prisma.review.delete({ where: { id } });
}
