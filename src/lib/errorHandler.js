import { NextResponse } from "next/server";

export function withErrorHandler(handler) {
  return async function (...args) {
    try {
      return await handler(...args);
    } catch (error) {
      if (error.statusCode) {
        return NextResponse.json(
          { error: { message: error.message, statusCode: error.statusCode } },
          { status: error.statusCode }
        );
      }
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: { message: "Invalid JSON", statusCode: 400 } },
          { status: 400 }
        );
      }
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: { message: "Internal server error", statusCode: 500 } },
        { status: 500 }
      );
    }
  };
}
