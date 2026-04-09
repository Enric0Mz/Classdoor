import prisma from "@/lib/prisma";

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  universityEmail: true,
  emailVerified: true,
  verified: true,
  role: true,
  authProvider: true,
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
  return prisma.user.findUnique({
    where: { email },
    select: USER_PUBLIC_SELECT,
  });
}

export async function findByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    select: USER_PUBLIC_SELECT,
  });
}

/**
 * Returns the full user record including password hash.
 * Only use this for authentication flows (login, password verification).
 */
export async function findByEmailForAuth(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Returns the full user record including password hash.
 * Only use this for authentication flows (login, password verification).
 */
export async function findByUsernameForAuth(username) {
  return prisma.user.findUnique({ where: { username } });
}

export async function findByGoogleId(googleId) {
  return prisma.user.findUnique({ where: { googleId } });
}

export async function create(data) {
  return prisma.user.create({ data });
}

export async function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}
