import { AppError } from "@/errors/AppError";
import * as universityRepository from "@/repositories/universityRepository";

const VALID_TYPES = ["PUBLIC", "PRIVATE"];

export async function createUniversity({ name, location, website, image, type, courses, rating }) {
  if (!name) {
    throw new AppError("Name is required", 400);
  }

  if (!location) {
    throw new AppError("Location is required", 400);
  }

  if (!type) {
    throw new AppError("Type is required", 400);
  }

  if (!VALID_TYPES.includes(type)) {
    throw new AppError("Type must be PUBLIC or PRIVATE", 400);
  }

  const existing = await universityRepository.findByName(name);
  if (existing) {
    throw new AppError("A university with this name already exists", 409);
  }

  return universityRepository.create({ name, location, website, image, type, courses, rating });
}

export async function listUniversities() {
  return universityRepository.findAll();
}
