import prisma from "@/lib/prisma";

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  universityEmail: true,
  verified: true,
  active: true,
  role: true,
  createdAt: true,
};

export async function findAll({ skip, take } = {}) {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ where: { active: true }, select: USER_PUBLIC_SELECT, skip, take }),
    prisma.user.count({ where: { active: true } }),
  ]);
  return { data, total };
}

export async function findById(id) {
  return prisma.user.findFirst({ where: { id, active: true }, select: USER_PUBLIC_SELECT });
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

export async function deactivate(id) {
  return prisma.user.update({ where: { id }, data: { active: false } });
}
