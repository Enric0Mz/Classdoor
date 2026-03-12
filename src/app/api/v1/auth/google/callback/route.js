import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleGoogleCallback } from "@/domain/googleAuthService";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.APP_URL || "http://localhost:3000";

  // User denied access or Google returned an error
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
  }

  // Validate CSRF state and read intent
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const intent = cookieStore.get("oauth_intent")?.value || "register";

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
  }

  // Clear the cookies
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_intent");

  try {
    const result = await handleGoogleCallback(code, intent);

    if (result.type === "needs_username") {
      const chooseUsernameUrl = new URL(
        `${baseUrl}/auth/google/choose-username`,
      );
      chooseUsernameUrl.searchParams.set("token", result.pendingToken);
      return NextResponse.redirect(chooseUsernameUrl.toString());
    }

    const successUrl = new URL(`${baseUrl}/auth/google/success`);
    successUrl.searchParams.set("token", result.token);
    successUrl.searchParams.set("refreshToken", result.refreshToken);

    return NextResponse.redirect(successUrl.toString());
  } catch (err) {
    console.error("Google OAuth callback error:", err.message);

    const errorPage = intent === "login" ? "/login" : "/register";
    const errorCode =
      err.statusCode === 404 ? "google_no_account" : "google_auth_failed";

    return NextResponse.redirect(`${baseUrl}${errorPage}?error=${errorCode}`);
  }
}
