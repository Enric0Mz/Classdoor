import prisma from "@/lib/prisma";

export async function findAll() {
  return prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
}

export async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export async function create(data) {
  return prisma.user.create({ data });
}

export async function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

export async function remove(id) {
  return prisma.user.delete({ where: { id } });
}
