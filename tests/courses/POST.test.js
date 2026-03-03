import { createCourse } from "@/domain/courseService";
import * as courseRepository from "@/repositories/courseRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { POST } from "@/app/api/v1/courses/route";

jest.mock("@/repositories/courseRepository", () => ({
  create: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  requireVerifiedUser: jest.fn(),
}));

jest.mock("@/lib/authorization", () => ({
  requireRole: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const VALID_COURSE_BODY = {
  title: "Introduction to CS",
  description: "A beginner course",
  link: "https://example.com/cs101",
  price: 99.9,
  category: "Technology",
};

function makeRequest(body) {
  return {
    url: "http://localhost/api/v1/courses",
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("POST /api/v1/courses", () => {
  it("returns 201 when ADMIN creates a course", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockImplementation(() => {});
    const created = {
      id: "course-1",
      ...VALID_COURSE_BODY,
      active: true,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    courseRepository.create.mockResolvedValue(created);

    const response = await POST(makeRequest(VALID_COURSE_BODY));

    expect(response.status).toBe(201);
    expect(response.body).toEqual(created);
  });

  it("returns 403 when USER tries to create a course", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockReturnValue({
      id: "user-1",
      email: "user@test.com",
      role: "USER",
    });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const response = await POST(makeRequest(VALID_COURSE_BODY));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Forbidden: insufficient permissions",
        statusCode: 403,
      },
    });
  });

  it("returns 401 when no token is provided", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockImplementation(() => {
      throw new AppError("Unauthorized", 401);
    });

    const response = await POST(makeRequest(VALID_COURSE_BODY));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { message: "Unauthorized", statusCode: 401 },
    });
  });

  it("returns 400 when required fields are missing", async () => {
    requireVerifiedUser.mockReturnValue({
      id: "admin-1",
      email: "admin@test.com",
      role: "ADMIN",
    });
    requireRole.mockImplementation(() => {});

    const response = await POST(
      makeRequest({ description: "desc", link: "link" }),
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { message: "title is required", statusCode: 400 },
    });
  });
});
