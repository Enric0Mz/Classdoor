import bcrypt from "bcrypt";
import { AppError } from "@/errors/AppError";
import * as userRepository from "@/repositories/userRepository";
import { signToken } from "@/lib/auth";

const MINIMUM_PASSWORD_LENGTH = 8;

function stripPassword({ password, ...user }) {
  return user;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError("Invalid email format", 400);
  }
}

function validatePassword(password) {
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters long`,
      400
    );
  }
}

export async function registerUser({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  validateEmail(email);
  validatePassword(password);

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
  if (data.email) {
    validateEmail(data.email);
  }
  if (data.password) {
    validatePassword(data.password);
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await userRepository.update(id, data);
  return stripPassword(user);
}

export async function deleteUser(id) {
  return userRepository.remove(id);
}
