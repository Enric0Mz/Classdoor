import prisma from "@/lib/prisma";

export async function create({ userId, email, token, expiresAt, type }) {
  return prisma.emailVerificationToken.create({
    data: { userId, email, token, expiresAt, type, status: "PENDING" },
  });
}

export async function findByToken(token) {
  return prisma.emailVerificationToken.findUnique({ where: { token } });
}

export async function markAsUsed(token) {
  const { count } = await prisma.emailVerificationToken.updateMany({
    where: { token, status: "PENDING", expiresAt: { gt: new Date() } },
    data: { status: "USED" },
  });

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return { record: null, alreadyUsed: false };
  }

  if (count === 0 && record.status === "USED") {
    return { record, alreadyUsed: true };
  }

  if (count === 0 && record.status === "REVOKED") {
    return { record: null, alreadyUsed: false };
  }

  return { record, alreadyUsed: false };
}

export async function revokeByUserIdAndType(userId, type) {
  return prisma.emailVerificationToken.updateMany({
    where: { userId, type, status: "PENDING" },
    data: { status: "REVOKED" },
  });
}
