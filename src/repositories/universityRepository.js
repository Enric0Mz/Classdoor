import prisma from "@/lib/prisma";

export async function findAll() {
  return prisma.university.findMany();
}

export async function findByName(name) {
  return prisma.university.findUnique({ where: { name } });
}

export async function create(data) {
  return prisma.university.create({ data });
}
