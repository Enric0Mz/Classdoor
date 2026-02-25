import { listCourses } from "@/domain/courseService";
import * as courseRepository from "@/repositories/courseRepository";
import { GET } from "@/app/api/v1/courses/route";

jest.mock("@/repositories/courseRepository", () => ({
  findAll: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_COURSES = [
  { id: "course-1", title: "CS101", description: "Intro", link: "https://example.com/cs101", price: 99.9, category: "Technology", active: true, createdBy: "user-1", createdAt: new Date(), updatedAt: new Date() },
  { id: "course-2", title: "Math201", description: "Advanced", link: "https://example.com/math201", price: null, category: "Science", active: true, createdBy: "user-1", createdAt: new Date(), updatedAt: new Date() },
];

const PAGINATED_COURSES = { data: SAMPLE_COURSES, total: 2 };

function makeGetRequest(searchParams = "") {
  return { url: `http://localhost/api/v1/courses${searchParams}` };
}

describe("GET /api/v1/courses", () => {
  it("returns 200 with paginated courses using defaults", async () => {
    courseRepository.findAll.mockResolvedValue(PAGINATED_COURSES);

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: SAMPLE_COURSES,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it("returns 200 with correct pagination when page and limit are provided", async () => {
    courseRepository.findAll.mockResolvedValue(PAGINATED_COURSES);

    const response = await GET(makeGetRequest("?page=2&limit=5"));

    expect(courseRepository.findAll).toHaveBeenCalledWith({ category: null, skip: 5, take: 5 });
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, limit: 5, total: 2, totalPages: 1 });
  });

  it("returns 200 filtered by category", async () => {
    const filtered = { data: [SAMPLE_COURSES[0]], total: 1 };
    courseRepository.findAll.mockResolvedValue(filtered);

    const response = await GET(makeGetRequest("?category=Technology"));

    expect(courseRepository.findAll).toHaveBeenCalledWith({ category: "Technology", skip: 0, take: 10 });
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([SAMPLE_COURSES[0]]);
  });

  it("returns 500 on repository error", async () => {
    courseRepository.findAll.mockRejectedValue(new Error("Database failure"));

    const response = await GET(makeGetRequest());

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
