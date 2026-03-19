import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, generateOAuthState } from "@/lib/googleOAuth";

const VALID_INTENTS = ["login", "register"];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const intent = searchParams.get("intent") || "register";

  const safeIntent = VALID_INTENTS.includes(intent) ? intent : "register";

  const state = generateOAuthState();

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  cookieStore.set("oauth_intent", safeIntent, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const authUrl = buildGoogleAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
