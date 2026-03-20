import prisma from "@/lib/prisma";

export async function create({ userId, universityEmail, token, expiresAt }) {
  return prisma.universityEmailVerification.create({
    data: { userId, universityEmail, token, expiresAt },
  });
}

export async function findByToken(token) {
  return prisma.universityEmailVerification.findUnique({ where: { token } });
}

export async function claimByToken(token) {
  try {
    return await prisma.universityEmailVerification.delete({ where: { token } });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
}

export async function deleteByUserId(userId) {
  return prisma.universityEmailVerification.deleteMany({ where: { userId } });
}
