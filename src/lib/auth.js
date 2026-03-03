import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "@/errors/AppError";
import * as userRepository from "@/repositories/userRepository";
import * as refreshTokenRepository from "@/repositories/refreshTokenRepository";

const MAX_REFRESH_TOKENS_PER_USER = 5;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "Fatal Error: JWT_SECRET environment variable is not defined.",
  );
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export function signToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function verifyToken(request) {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = header.slice(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

export async function requireVerifiedUser(request) {
  const decoded = verifyToken(request);
  const user = await userRepository.findById(decoded.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.role !== "ADMIN" && !user.emailVerified) {
    throw new AppError("Email verification required", 403);
  }

  return decoded;
}

export function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

export async function createRefreshToken(userId) {
  const token = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await refreshTokenRepository.create({ token, userId, expiresAt });
  await refreshTokenRepository.deleteOldestByUserId(
    userId,
    MAX_REFRESH_TOKENS_PER_USER,
  );

  return token;
}

export async function rotateRefreshToken(oldToken) {
  const storedToken = await refreshTokenRepository.findByToken(oldToken);

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await refreshTokenRepository.deleteByToken(oldToken);
    throw new AppError("Refresh token expired", 401);
  }

  await refreshTokenRepository.deleteByToken(oldToken);

  const user = await userRepository.findById(storedToken.userId);
  if (!user) {
    throw new AppError("User not found", 401);
  }

  const accessToken = signToken({
    id: user.id,
    email: user.email || null,
    role: user.role,
  });
  const newRefreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function invalidateRefreshToken(token) {
  const storedToken = await refreshTokenRepository.findByToken(token);

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  await refreshTokenRepository.deleteByToken(token);
}
