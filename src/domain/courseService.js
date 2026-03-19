import { AppError } from "@/errors/AppError";
import { sanitizeString } from "@/lib/sanitize";
import * as courseRepository from "@/repositories/courseRepository";

export async function listCourses({ skip, take, category } = {}) {
  const { data, total } = await courseRepository.findAll({
    skip,
    take,
    category,
  });
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

  const sanitizedTitle = sanitizeString(title);
  const sanitizedDescription = sanitizeString(description);
  const sanitizedLink = sanitizeString(link);
  const sanitizedCategory = category ? sanitizeString(category) : null;

  if (!sanitizedTitle) {
    throw new AppError("title is required", 400);
  }
  if (!sanitizedDescription) {
    throw new AppError("description is required", 400);
  }
  if (!sanitizedLink) {
    throw new AppError("link is required", 400);
  }

  return courseRepository.create({
    title: sanitizedTitle,
    description: sanitizedDescription,
    link: sanitizedLink,
    image: image ?? null,
    price: price ?? null,
    category: sanitizedCategory,
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

  if (title !== undefined) updateData.title = sanitizeString(title);
  if (description !== undefined)
    updateData.description = sanitizeString(description);
  if (link !== undefined) updateData.link = sanitizeString(link);
  if (image !== undefined) updateData.image = image;
  if (price !== undefined) updateData.price = price;
  if (category !== undefined) updateData.category = sanitizeString(category);
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
