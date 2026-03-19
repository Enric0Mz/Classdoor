import { NextResponse } from "next/server";
import { isRequestAllowed } from "@/lib/rateLimiter";

const ALLOWED_ORIGINS = [
  "https://www.infocampus.com.br",
  "https://qa.infocampus.com.br",
  "http://localhost:3000",
];

const VERCEL_PREVIEW_PATTERN = /^https:\/\/[\w-]+\.vercel\.app$/;

const STATE_CHANGING_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * Returns the CORS headers with the origin set dynamically
 * only if it matches an allowed origin.
 *
 * @param {string} origin - The request's Origin header value
 * @returns {object} CORS headers object
 */
function getCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

/**
 * Checks whether the given origin is in the allowed list
 * or matches the Vercel preview URL pattern.
 *
 * @param {string|null} origin
 * @returns {boolean}
 */
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return VERCEL_PREVIEW_PATTERN.test(origin);
}

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
  {
    pathname: "/api/v1/users/login",
    method: "POST",
    group: "auth",
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  },
  {
    pathname: "/api/v1/users",
    method: "POST",
    group: "auth",
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  },
  {
    pathname: "/api/v1/users/refresh",
    method: "POST",
    group: "auth",
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  },

  // Token verification — prevent token enumeration attacks
  {
    pathname: "/api/v1/users/me/email/verify",
    method: "PUT",
    group: "token-verify",
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  },
  {
    pathname: "/api/v1/users/me/university-email/verify",
    method: "POST",
    group: "token-verify",
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
  },

  // Email resend — prevent email bombing
  {
    pathname: "/api/v1/users/me/email/verify",
    method: "POST",
    group: "email-resend",
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  },

  // University submissions — prevent spam
  {
    pathname: "/api/v1/university-submissions",
    method: "POST",
    group: "university-submissions",
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
  },

  // Public listing endpoints — scraping deterrent
  {
    pathname: "/api/v1/reviews",
    method: "GET",
    group: "public-listing",
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  {
    pathname: "/api/v1/universities",
    method: "GET",
    group: "public-listing",
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  {
    pathname: "/api/v1/courses",
    method: "GET",
    group: "public-listing",
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
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
    (rule) => rule.pathname === pathname && rule.method === method,
  );
}

export function middleware(request) {
  const origin = request.headers.get("origin");
  const originAllowed = isAllowedOrigin(origin);

  // Handle preflight OPTIONS requests sent by browsers before cross-origin requests
  if (request.method === "OPTIONS") {
    if (!originAllowed) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(origin),
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // CSRF protection: block state-changing requests from unknown origins.
  // Browsers always send the Origin header on cross-origin requests, so a
  // missing or non-matching origin on POST/PUT/DELETE means the request is
  // either cross-site (CSRF) or coming from a context we don't trust.
  if (STATE_CHANGING_METHODS.includes(request.method) && !originAllowed) {
    return NextResponse.json(
      {
        error: {
          message: "Forbidden: origin not allowed",
          statusCode: 403,
        },
      },
      { status: 403 },
    );
  }

  // Apply rate limiting before passing the request to the route handler
  const { pathname } = new URL(request.url);
  const matchedRule = findMatchingRule(pathname, request.method);

  if (matchedRule) {
    const clientIp = getClientIp(request);
    const rateLimitKey = `${clientIp}:${matchedRule.group}`;
    const retryAfterSeconds = Math.ceil(matchedRule.windowMs / 1000);

    if (
      !isRequestAllowed(
        rateLimitKey,
        matchedRule.maxRequests,
        matchedRule.windowMs,
      )
    ) {
      const headers = originAllowed
        ? {
            ...getCorsHeaders(origin),
            "Retry-After": String(retryAfterSeconds),
          }
        : { "Retry-After": String(retryAfterSeconds) };

      return NextResponse.json(
        {
          error: {
            message: "Too many requests, please try again later.",
            statusCode: 429,
          },
        },
        { status: 429, headers },
      );
    }
  }

  const response = NextResponse.next();

  // Only attach CORS headers when the origin is trusted
  if (originAllowed) {
    Object.entries(getCorsHeaders(origin)).forEach(
      ([headerName, headerValue]) => {
        response.headers.set(headerName, headerValue);
      },
    );
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
