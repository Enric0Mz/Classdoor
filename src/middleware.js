import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

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

  const response = NextResponse.next();

  Object.entries(CORS_HEADERS).forEach(([headerName, headerValue]) => {
    response.headers.set(headerName, headerValue);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
