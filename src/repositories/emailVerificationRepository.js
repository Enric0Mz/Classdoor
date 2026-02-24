import prisma from "@/lib/prisma";

export async function create({ userId, email, token, expiresAt }) {
  return prisma.emailVerification.create({
    data: { userId, email, token, expiresAt },
  });
}

export async function findByToken(token) {
  return prisma.emailVerification.findUnique({ where: { token } });
}

export async function deleteByUserId(userId) {
  return prisma.emailVerification.deleteMany({ where: { userId } });
}
