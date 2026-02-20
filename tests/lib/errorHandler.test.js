import { withErrorHandler } from "@/lib/errorHandler";
import { AppError } from "@/errors/AppError";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

describe("withErrorHandler", () => {
  it("passes through the handler return value when no error is thrown", async () => {
    const expectedResponse = { body: { data: "ok" }, status: 200 };
    const handler = jest.fn().mockResolvedValue(expectedResponse);
    const wrappedHandler = withErrorHandler(handler);

    const result = await wrappedHandler("request-arg", "context-arg");

    expect(result).toBe(expectedResponse);
    expect(handler).toHaveBeenCalledWith("request-arg", "context-arg");
  });

  it("returns a structured error response when an AppError is thrown", async () => {
    const handler = jest.fn().mockRejectedValue(new AppError("Not found", 404));
    const wrappedHandler = withErrorHandler(handler);

    const result = await wrappedHandler();

    expect(result.status).toBe(404);
    expect(result.body).toEqual({ error: { message: "Not found", statusCode: 404 } });
  });

  it("returns a 400 response when a SyntaxError is thrown (malformed JSON)", async () => {
    const handler = jest.fn().mockRejectedValue(new SyntaxError("Unexpected token"));
    const wrappedHandler = withErrorHandler(handler);

    const result = await wrappedHandler();

    expect(result.status).toBe(400);
    expect(result.body).toEqual({ error: { message: "Invalid JSON", statusCode: 400 } });
  });

  it("returns a 500 response when a generic Error is thrown", async () => {
    const handler = jest.fn().mockRejectedValue(new Error("Something broke"));
    const wrappedHandler = withErrorHandler(handler);

    const result = await wrappedHandler();

    expect(result.status).toBe(500);
    expect(result.body).toEqual({ error: { message: "Internal server error", statusCode: 500 } });
  });

  it("logs unexpected errors to console.error", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const unexpectedError = new Error("Something broke");
    const handler = jest.fn().mockRejectedValue(unexpectedError);
    const wrappedHandler = withErrorHandler(handler);

    await wrappedHandler();

    expect(consoleSpy).toHaveBeenCalledWith("Unexpected error:", unexpectedError);
    consoleSpy.mockRestore();
  });
});
