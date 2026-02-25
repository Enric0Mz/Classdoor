import { updateCourse } from "@/domain/courseService";
import * as courseRepository from "@/repositories/courseRepository";
import { requireVerifiedUser } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { PUT } from "@/app/api/v1/courses/[id]/route";

jest.mock("@/repositories/courseRepository", () => ({
  findById: jest.fn(),
  update: jest.fn(),
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

const COURSE = {
  id: "course-1",
  title: "CS101",
  description: "Intro to CS",
  image: null,
  link: "https://example.com/cs101",
  price: 99.9,
  category: "Technology",
  active: true,
  createdBy: "admin-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const UPDATE_DATA = { title: "Updated CS101" };

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("PUT /api/v1/courses/:id", () => {
  it("returns 200 when ADMIN updates a course", async () => {
    requireVerifiedUser.mockReturnValue({ id: "admin-1", email: "admin@test.com", role: "ADMIN" });
    requireRole.mockImplementation(() => {});
    const updatedCourse = { ...COURSE, title: "Updated CS101" };
    courseRepository.findById.mockResolvedValue(COURSE);
    courseRepository.update.mockResolvedValue(updatedCourse);

    const request = { json: jest.fn().mockResolvedValue(UPDATE_DATA) };

    const response = await PUT(request, makeParams("course-1"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedCourse);
  });

  it("returns 403 when USER tries to update", async () => {
    const { AppError } = require("@/errors/AppError");
    requireVerifiedUser.mockReturnValue({ id: "user-1", email: "user@test.com", role: "USER" });
    requireRole.mockImplementation(() => {
      throw new AppError("Forbidden: insufficient permissions", 403);
    });

    const request = { json: jest.fn().mockResolvedValue(UPDATE_DATA) };

    const response = await PUT(request, makeParams("course-1"));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { message: "Forbidden: insufficient permissions", statusCode: 403 },
    });
  });

  it("returns 404 when course is not found", async () => {
    requireVerifiedUser.mockReturnValue({ id: "admin-1", email: "admin@test.com", role: "ADMIN" });
    requireRole.mockImplementation(() => {});
    courseRepository.findById.mockResolvedValue(null);

    const request = { json: jest.fn().mockResolvedValue(UPDATE_DATA) };

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "Course not found", statusCode: 404 },
    });
  });
});
