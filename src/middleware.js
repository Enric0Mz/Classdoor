import { NextResponse } from "next/server";
import { isRequestAllowed } from "@/lib/rateLimiter";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

/**
 * Rate limit rules applied per route and HTTP method.
 * Rules are evaluated in order; the first matching rule for a given
 * (pathname + method) pair wins.
 *
 * group      - Shared counter name. Routes in the same group share their
 *              request counter per IP, so the limit applies across all of them.
 * maxRequests - Max requests allowed within the window.
 * windowMs   - Sliding window duration in milliseconds.
 */
const RATE_LIMIT_RULES = [
  // Auth endpoints — brute force / credential stuffing protection
  { pathname: "/api/v1/users/login",   method: "POST", group: "auth", maxRequests: 10, windowMs: 15 * 60 * 1000 },
  { pathname: "/api/v1/users",         method: "POST", group: "auth", maxRequests: 10, windowMs: 15 * 60 * 1000 },
  { pathname: "/api/v1/users/refresh", method: "POST", group: "auth", maxRequests: 10, windowMs: 15 * 60 * 1000 },

  // Token verification — prevent token enumeration attacks
  { pathname: "/api/v1/users/me/email/verify",            method: "PUT",  group: "token-verify", maxRequests: 10, windowMs: 15 * 60 * 1000 },
  { pathname: "/api/v1/users/me/university-email/verify", method: "POST", group: "token-verify", maxRequests: 10, windowMs: 15 * 60 * 1000 },

  // Email resend — prevent email bombing
  { pathname: "/api/v1/users/me/email/verify", method: "POST", group: "email-resend", maxRequests: 5, windowMs: 60 * 60 * 1000 },

  // Public listing endpoints — scraping deterrent
  { pathname: "/api/v1/reviews",      method: "GET", group: "public-listing", maxRequests: 100, windowMs: 60 * 1000 },
  { pathname: "/api/v1/universities", method: "GET", group: "public-listing", maxRequests: 100, windowMs: 60 * 1000 },
  { pathname: "/api/v1/courses",      method: "GET", group: "public-listing", maxRequests: 100, windowMs: 60 * 1000 },
];

/**
 * Extracts the client IP address from the request headers.
 * Respects X-Forwarded-For for requests behind a reverse proxy.
 *
 * @param {Request} request
 * @returns {string}
 */
function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Finds the first rate limit rule that matches the given pathname and method.
 *
 * @param {string} pathname
 * @param {string} method
 * @returns {object|undefined}
 */
function findMatchingRule(pathname, method) {
  return RATE_LIMIT_RULES.find(
    (rule) => rule.pathname === pathname && rule.method === method
  );
}

export function middleware(request) {
  // Handle preflight OPTIONS requests sent by browsers before cross-origin requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
      },
    });
  }

  // Apply rate limiting before passing the request to the route handler
  const { pathname } = new URL(request.url);
  const matchedRule = findMatchingRule(pathname, request.method);

  if (matchedRule) {
    const clientIp = getClientIp(request);
    const rateLimitKey = `${clientIp}:${matchedRule.group}`;
    const retryAfterSeconds = Math.ceil(matchedRule.windowMs / 1000);

    if (!isRequestAllowed(rateLimitKey, matchedRule.maxRequests, matchedRule.windowMs)) {
      return NextResponse.json(
        { error: { message: "Too many requests, please try again later.", statusCode: 429 } },
        {
          status: 429,
          headers: {
            // Include CORS headers so the browser can read the 429 response body
            ...CORS_HEADERS,
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  Object.entries(CORS_HEADERS).forEach(([headerName, headerValue]) => {
    response.headers.set(headerName, headerValue);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
