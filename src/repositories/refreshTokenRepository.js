import prisma from "@/lib/prisma";

export async function create({ token, userId, expiresAt }) {
  return prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
}

export async function findByToken(token) {
  return prisma.refreshToken.findUnique({ where: { token } });
}

export async function deleteByToken(token) {
  return prisma.refreshToken.delete({ where: { token } });
}

export async function deleteOldestByUserId(userId, keepCount) {
  const tokens = await prisma.refreshToken.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: keepCount,
    select: { id: true },
  });

  if (tokens.length === 0) return;

  const idsToDelete = tokens.map((token) => token.id);
  return prisma.refreshToken.deleteMany({
    where: { id: { in: idsToDelete } },
  });
}

