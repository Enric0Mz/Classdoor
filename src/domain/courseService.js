import { AppError } from "@/errors/AppError";
import * as courseRepository from "@/repositories/courseRepository";

export async function listCourses({ skip, take, category } = {}) {
  const { data, total } = await courseRepository.findAll({ skip, take, category });
  return { data, total };
}

export async function getCourseById(id) {
  const course = await courseRepository.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  return course;
}

export async function createCourse(body, creatorId) {
  const { title, description, link, image, price, category } = body;

  if (!title) {
    throw new AppError("title is required", 400);
  }
  if (!description) {
    throw new AppError("description is required", 400);
  }
  if (!link) {
    throw new AppError("link is required", 400);
  }

  return courseRepository.create({
    title: title.trim(),
    description: description.trim(),
    link: link.trim(),
    image: image ?? null,
    price: price ?? null,
    category: category ?? null,
    createdBy: creatorId,
  });
}

export async function updateCourse(id, body) {
  const course = await courseRepository.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const { title, description, link, image, price, category, active } = body;
  const updateData = {};

  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (link !== undefined) updateData.link = link.trim();
  if (image !== undefined) updateData.image = image;
  if (price !== undefined) updateData.price = price;
  if (category !== undefined) updateData.category = category;
  if (active !== undefined) updateData.active = active;

  return courseRepository.update(id, updateData);
}

export async function deleteCourse(id) {
  const course = await courseRepository.findById(id);
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  return courseRepository.remove(id);
}
