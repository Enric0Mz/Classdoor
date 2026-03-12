import jwt from "jsonwebtoken";
import { AppError } from "@/errors/AppError";
import * as userRepository from "@/repositories/userRepository";
import * as universityRepository from "@/repositories/universityRepository";
import { signToken, createRefreshToken } from "@/lib/auth";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/googleOAuth";
import { generateUsername } from "@/lib/generateUsername";

const JWT_SECRET = process.env.JWT_SECRET;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function validateUsername(username) {
  if (!username) {
    throw new AppError("Username is required", 400);
  }
  if (!USERNAME_REGEX.test(username)) {
    throw new AppError(
      "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      400,
    );
  }
}

function stripPassword({ password, ...user }) {
  return user;
}

async function linkUniversityIfApplicable(userId, email) {
  const domain = email.split("@")[1].toLowerCase();
  const linkedUniversity = await universityRepository.findByEmailDomain(domain);

  if (linkedUniversity) {
    await userRepository.update(userId, {
      universityEmail: email,
      verified: true,
      universityId: linkedUniversity.id,
    });
  }
}

async function generateUniqueUsername() {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const username = generateUsername();
    const existingUser = await userRepository.findByUsername(username);
    if (!existingUser) {
      return username;
    }
  }
  throw new AppError("Failed to generate a unique username", 500);
}

export async function authenticateWithGoogle(code) {
  const googleTokens = await exchangeCodeForTokens(code);
  const googleUser = await fetchGoogleUserInfo(googleTokens.access_token);

  if (!googleUser.email || !googleUser.emailVerified) {
    throw new AppError(
      "Google account must have a verified email address",
      400,
    );
  }

  return googleUser;
}

export async function handleGoogleCallback(code, intent) {
  const googleUser = await authenticateWithGoogle(code);

  if (intent === "login") {
    return { type: "authenticated", ...(await handleGoogleLogin(googleUser)) };
  }

  // For register intent, check if user already exists (login or link them directly)
  const existingByGoogleId = await userRepository.findByGoogleId(
    googleUser.googleId,
  );
  if (existingByGoogleId) {
    return {
      type: "authenticated",
      ...(await loginExistingUser(existingByGoogleId)),
    };
  }

  const existingByEmail = await userRepository.findByEmail(googleUser.email);
  if (existingByEmail) {
    return {
      type: "authenticated",
      ...(await linkGoogleToExistingAccount(existingByEmail, googleUser)),
    };
  }

  // New user — they need to choose a username first
  const pendingToken = jwt.sign(
    {
      googleId: googleUser.googleId,
      email: googleUser.email,
      purpose: "google_registration",
    },
    JWT_SECRET,
    { expiresIn: "10m" },
  );

  return { type: "needs_username", pendingToken };
}

export async function completeGoogleRegistration(pendingToken, username) {
  let decoded;
  try {
    decoded = jwt.verify(pendingToken, JWT_SECRET);
  } catch {
    throw new AppError("Registration session expired. Please try again.", 400);
  }

  if (decoded.purpose !== "google_registration") {
    throw new AppError("Invalid registration token.", 400);
  }

  validateUsername(username);

  const existingUsername = await userRepository.findByUsername(username);
  if (existingUsername) {
    throw new AppError("A user with this username already exists", 409);
  }

  const googleUser = { googleId: decoded.googleId, email: decoded.email };
  return await handleGoogleRegister(googleUser, username);
}

export async function handleGoogleLogin(googleUser) {
  // Check if user already exists by googleId
  const existingByGoogleId = await userRepository.findByGoogleId(
    googleUser.googleId,
  );
  if (existingByGoogleId) {
    return await loginExistingUser(existingByGoogleId);
  }

  // Check if user exists by email (local account that needs linking)
  const existingByEmail = await userRepository.findByEmail(googleUser.email);
  if (existingByEmail) {
    return await linkGoogleToExistingAccount(existingByEmail, googleUser);
  }

  throw new AppError(
    "No account found with this Google email. Please register first.",
    404,
  );
}

export async function handleGoogleRegister(googleUser, username) {
  // Check if user already exists by googleId (already registered)
  const existingByGoogleId = await userRepository.findByGoogleId(
    googleUser.googleId,
  );
  if (existingByGoogleId) {
    return await loginExistingUser(existingByGoogleId);
  }

  // Check if user exists by email (local account that needs linking)
  const existingByEmail = await userRepository.findByEmail(googleUser.email);
  if (existingByEmail) {
    return await linkGoogleToExistingAccount(existingByEmail, googleUser);
  }

  // Create a brand new user with the chosen username
  return await createGoogleUser(googleUser, username);
}

async function loginExistingUser(user) {
  const token = signToken({
    id: user.id,
    email: user.email || null,
    role: user.role,
  });
  const refreshToken = await createRefreshToken(user.id);

  return { user: stripPassword(user), token, refreshToken };
}

async function linkGoogleToExistingAccount(existingUser, googleUser) {
  const updatedUser = await userRepository.update(existingUser.id, {
    googleId: googleUser.googleId,
    authProvider: existingUser.password ? "local_and_google" : "google",
    emailVerified: true,
  });

  if (!existingUser.verified) {
    await linkUniversityIfApplicable(existingUser.id, googleUser.email);
  }

  const token = signToken({
    id: updatedUser.id,
    email: updatedUser.email || null,
    role: updatedUser.role,
  });
  const refreshToken = await createRefreshToken(updatedUser.id);

  return { user: stripPassword(updatedUser), token, refreshToken };
}

async function createGoogleUser(googleUser, username) {
  if (!username) {
    username = await generateUniqueUsername();
  }

  const newUser = await userRepository.create({
    email: googleUser.email,
    username,
    googleId: googleUser.googleId,
    authProvider: "google",
    emailVerified: true,
  });

  await linkUniversityIfApplicable(newUser.id, googleUser.email);

  const token = signToken({
    id: newUser.id,
    email: newUser.email || null,
    role: newUser.role,
  });
  const refreshToken = await createRefreshToken(newUser.id);

  // Re-fetch to get updated university fields
  const finalUser = await userRepository.findById(newUser.id);

  return { user: stripPassword(finalUser), token, refreshToken };
}
