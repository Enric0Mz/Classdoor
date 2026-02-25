import prisma from "@/lib/prisma";

const COURSE_SELECT = {
  id: true,
  title: true,
  description: true,
  image: true,
  link: true,
  price: true,
  category: true,
  active: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
};

export async function findAll({ skip, take, category } = {}) {
  const where = { active: true };
  if (category) {
    where.category = category;
  }
  const [data, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      select: COURSE_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.course.count({ where }),
  ]);
  return { data, total };
}

export async function findById(id) {
  return prisma.course.findUnique({
    where: { id },
    select: COURSE_SELECT,
  });
}

export async function create(data) {
  return prisma.course.create({
    data,
    select: COURSE_SELECT,
  });
}

export async function update(id, data) {
  return prisma.course.update({
    where: { id },
    data,
    select: COURSE_SELECT,
  });
}

export async function remove(id) {
  return prisma.course.delete({ where: { id } });
}
