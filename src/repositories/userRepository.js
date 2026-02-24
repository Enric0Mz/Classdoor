import prisma from "@/lib/prisma";

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  universityEmail: true,
  emailVerified: true,
  verified: true,
  active: true,
  role: true,
  createdAt: true,
};

export async function findAll({ skip, take } = {}) {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ select: USER_PUBLIC_SELECT, skip, take }),
    prisma.user.count(),
  ]);
  return { data, total };
}

export async function findById(id) {
  return prisma.user.findFirst({ where: { id }, select: USER_PUBLIC_SELECT });
}

export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

export async function create(data) {
  return prisma.user.create({ data });
}

export async function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id) {
  return prisma.$transaction([
    prisma.review.updateMany({
      where: { authorId: id },
      data: { authorId: null },
    }),
    prisma.emailVerification.deleteMany({ where: { userId: id } }),
    prisma.universityEmailVerification.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
}
