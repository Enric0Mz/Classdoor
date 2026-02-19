import prisma from "@/lib/prisma";

export async function create({ userId, universityEmail, token, expiresAt }) {
  return prisma.universityEmailVerification.create({
    data: { userId, universityEmail, token, expiresAt },
  });
}

export async function findByToken(token) {
  return prisma.universityEmailVerification.findUnique({ where: { token } });
}

export async function deleteByUserId(userId) {
  return prisma.universityEmailVerification.deleteMany({ where: { userId } });
}
