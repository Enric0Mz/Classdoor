import { AppError } from "@/errors/AppError";
import * as universityRepository from "@/repositories/universityRepository";

export async function createUniversity({ name, location, website }) {
  if (!name) {
    throw new AppError("Name is required", 400);
  }

  if (!location) {
    throw new AppError("Location is required", 400);
  }

  const existing = await universityRepository.findByName(name);
  if (existing) {
    throw new AppError("A university with this name already exists", 409);
  }

  return universityRepository.create({ name, location, website });
}

export async function listUniversities() {
  return universityRepository.findAll();
}
