import prisma from "@/lib/prisma";

const REVIEW_AUTHOR_SELECT = {
  id: true,
  username: true,
  verified: true,
};

export async function findAll() {
  return prisma.university.findMany();
}

export async function findById(id) {
  return prisma.university.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { author: { select: REVIEW_AUTHOR_SELECT } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function findByName(name) {
  return prisma.university.findUnique({ where: { name } });
}

export async function create(data) {
  return prisma.university.create({ data });
}
