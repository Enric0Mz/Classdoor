import bcrypt from "bcryptjs";
import { AppError } from "@/errors/AppError";
import * as userRepository from "@/repositories/userRepository";
import * as emailVerificationService from "@/domain/emailVerificationService";
import { signToken, createRefreshToken } from "@/lib/auth";
import { generateUsername } from "@/lib/generateUsername";

const MINIMUM_PASSWORD_LENGTH = 8;
const MAXIMUM_PASSWORD_LENGTH = 40;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

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
      400,
    );
  }
  if (password.length > MAXIMUM_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at most ${MAXIMUM_PASSWORD_LENGTH} characters long`,
      400,
    );
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError(
      "Password must contain at least one uppercase letter",
      400,
    );
  }
  if (!/[a-z]/.test(password)) {
    throw new AppError(
      "Password must contain at least one lowercase letter",
      400,
    );
  }
  if (!/[0-9]/.test(password)) {
    throw new AppError("Password must contain at least one number", 400);
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new AppError("Password must contain at least one symbol", 400);
  }
}

function validateUsername(username) {
  if (!USERNAME_REGEX.test(username)) {
    throw new AppError(
      "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      400,
    );
  }
}

export async function registerUser({ email, password, username } = {}) {
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  validatePassword(password);

  const hash = await bcrypt.hash(password, 10);

  if (email) {
    validateEmail(email);

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new AppError("A user with this email already exists", 409);
    }
  }

  const resolvedUsername = username || generateUsername();
  validateUsername(resolvedUsername);

  const existingUsername =
    await userRepository.findByUsername(resolvedUsername);
  if (existingUsername) {
    throw new AppError("A user with this username already exists", 409);
  }

  const userData = { username: resolvedUsername, password: hash };
  if (email) {
    userData.email = email;
  }

  const user = await userRepository.create(userData);
  const token = signToken({
    id: user.id,
    email: user.email || null,
    role: user.role,
  });
  const refreshToken = await createRefreshToken(user.id);

  if (user.email) {
    await emailVerificationService.sendEmailVerificationToUser(
      user.id,
      user.email,
    );
  }

  return { user: stripPassword(user), token, refreshToken };
}

export async function loginUser({ identifier, password }) {
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  if (!identifier) {
    throw new AppError("Email or username is required", 400);
  }

  const isEmail = EMAIL_REGEX.test(identifier);
  const user = isEmail
    ? await userRepository.findByEmail(identifier)
    : await userRepository.findByUsername(identifier);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({
    id: user.id,
    email: user.email || null,
    role: user.role,
  });
  const refreshToken = await createRefreshToken(user.id);
  return { user: stripPassword(user), token, refreshToken };
}

export async function listUsers({ skip, take } = {}) {
  return userRepository.findAll({ skip, take });
}

export async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return stripPassword(user);
}

export async function updateUser(id, data) {
  const { email, password, username } = data;
  const updateData = {};

  if (username !== undefined) {
    validateUsername(username);
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername && existingUsername.id !== id) {
      throw new AppError("A user with this username already exists", 409);
    }
    updateData.username = username;
  }

  if (email !== undefined) {
    validateEmail(email);
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail && existingEmail.id !== id) {
      throw new AppError("A user with this email already exists", 409);
    }
    updateData.email = email;
  }

  if (password !== undefined) {
    validatePassword(password);
    updateData.password = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return getUserById(id);
  }

  const user = await userRepository.update(id, updateData);
  return stripPassword(user);
}

export async function deleteUser(id) {
  return userRepository.deleteUser(id);
}
