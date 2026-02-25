import { getCourseById } from "@/domain/courseService";
import * as courseRepository from "@/repositories/courseRepository";
import { GET } from "@/app/api/v1/courses/[id]/route";

jest.mock("@/repositories/courseRepository", () => ({
  findById: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_COURSE = {
  id: "course-1",
  title: "CS101",
  description: "Intro to CS",
  image: null,
  link: "https://example.com/cs101",
  price: 99.9,
  category: "Technology",
  active: true,
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/v1/courses/:id", () => {
  it("returns 200 when course is found", async () => {
    courseRepository.findById.mockResolvedValue(SAMPLE_COURSE);

    const response = await GET({}, makeParams("course-1"));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(SAMPLE_COURSE);
  });

  it("returns 404 when course is not found", async () => {
    courseRepository.findById.mockResolvedValue(null);

    const response = await GET({}, makeParams("missing"));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "Course not found", statusCode: 404 },
    });
  });
});
