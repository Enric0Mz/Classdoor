import prisma from "@/lib/prisma";

export async function create({ userId, email, token, expiresAt }) {
  return prisma.passwordResetToken.create({
    data: { userId, email, token, expiresAt, status: "PENDING" },
  });
}

export async function findByToken(token) {
  return prisma.passwordResetToken.findUnique({ where: { token } });
}

export async function markAsUsed(token) {
  const { count } = await prisma.passwordResetToken.updateMany({
    where: { token, status: "PENDING", expiresAt: { gt: new Date() } },
    data: { status: "USED" },
  });

  const record = await prisma.passwordResetToken.findUnique({
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

export async function revokeByUserId(userId) {
  return prisma.passwordResetToken.updateMany({
    where: { userId, status: "PENDING" },
    data: { status: "REVOKED" },
  });
}
