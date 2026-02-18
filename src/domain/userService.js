import bcrypt from "bcrypt";
import { AppError } from "@/errors/AppError";
import * as userRepository from "@/repositories/userRepository";
import { signToken } from "@/lib/auth";

function stripPassword({ password, ...user }) {
  return user;
}

export async function registerUser({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError("A user with this email already exists", 409);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ email, password: hash });
  const token = signToken({ id: user.id, email: user.email });

  return { user: stripPassword(user), token };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: user.id, email: user.email });
  return { user: stripPassword(user), token };
}

export async function listUsers() {
  return userRepository.findAll();
}

export async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return stripPassword(user);
}

export async function updateUser(id, data) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await userRepository.update(id, data);
  return stripPassword(user);
}

export async function deleteUser(id) {
  return userRepository.remove(id);
}
