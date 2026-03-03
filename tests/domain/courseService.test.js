import {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/domain/courseService";
import * as courseRepository from "@/repositories/courseRepository";

jest.mock("@/repositories/courseRepository", () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

const SAMPLE_COURSE = {
  id: "course-1",
  title: "Introduction to CS",
  description: "A beginner course",
  image: null,
  link: "https://example.com/cs101",
  price: 99.9,
  category: "Technology",
  active: true,
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("courseService.listCourses", () => {
  it("returns paginated courses without filter", async () => {
    const paginated = { data: [SAMPLE_COURSE], total: 1 };
    courseRepository.findAll.mockResolvedValue(paginated);

    const result = await listCourses();

    expect(courseRepository.findAll).toHaveBeenCalledWith({
      skip: undefined,
      take: undefined,
      category: undefined,
    });
    expect(result).toEqual(paginated);
  });

  it("passes category filter to repository", async () => {
    const paginated = { data: [SAMPLE_COURSE], total: 1 };
    courseRepository.findAll.mockResolvedValue(paginated);

    const result = await listCourses({ category: "Technology" });

    expect(courseRepository.findAll).toHaveBeenCalledWith({
      skip: undefined,
      take: undefined,
      category: "Technology",
    });
    expect(result).toEqual(paginated);
  });
});

describe("courseService.getCourseById", () => {
  it("returns course when found", async () => {
    courseRepository.findById.mockResolvedValue(SAMPLE_COURSE);

    const result = await getCourseById("course-1");

    expect(result).toEqual(SAMPLE_COURSE);
  });

  it("throws 404 when course is not found", async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(getCourseById("missing")).rejects.toMatchObject({
      message: "Course not found",
      statusCode: 404,
    });
  });
});

describe("courseService.createCourse", () => {
  it("creates a course with valid data", async () => {
    const body = {
      title: "Introduction to CS",
      description: "A beginner course",
      link: "https://example.com/cs101",
      price: 99.9,
      category: "Technology",
    };
    courseRepository.create.mockResolvedValue(SAMPLE_COURSE);

    const result = await createCourse(body, "user-1");

    expect(courseRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Introduction to CS",
        description: "A beginner course",
        link: "https://example.com/cs101",
        createdBy: "user-1",
      }),
    );
    expect(result).toEqual(SAMPLE_COURSE);
  });

  it("throws 400 when title is missing", async () => {
    await expect(
      createCourse({ description: "desc", link: "link" }, "user-1"),
    ).rejects.toMatchObject({
      message: "title is required",
      statusCode: 400,
    });
    expect(courseRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when description is missing", async () => {
    await expect(
      createCourse({ title: "title", link: "link" }, "user-1"),
    ).rejects.toMatchObject({
      message: "description is required",
      statusCode: 400,
    });
    expect(courseRepository.create).not.toHaveBeenCalled();
  });

  it("throws 400 when link is missing", async () => {
    await expect(
      createCourse({ title: "title", description: "desc" }, "user-1"),
    ).rejects.toMatchObject({
      message: "link is required",
      statusCode: 400,
    });
    expect(courseRepository.create).not.toHaveBeenCalled();
  });
});

describe("courseService.updateCourse", () => {
  it("updates a course when found", async () => {
    const updatedCourse = { ...SAMPLE_COURSE, title: "Updated Title" };
    courseRepository.findById.mockResolvedValue(SAMPLE_COURSE);
    courseRepository.update.mockResolvedValue(updatedCourse);

    const result = await updateCourse("course-1", { title: "Updated Title" });

    expect(courseRepository.update).toHaveBeenCalledWith("course-1", {
      title: "Updated Title",
    });
    expect(result).toEqual(updatedCourse);
  });

  it("throws 404 when course is not found", async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(
      updateCourse("missing", { title: "Updated" }),
    ).rejects.toMatchObject({
      message: "Course not found",
      statusCode: 404,
    });
    expect(courseRepository.update).not.toHaveBeenCalled();
  });
});

describe("courseService.deleteCourse", () => {
  it("deletes a course when found", async () => {
    courseRepository.findById.mockResolvedValue(SAMPLE_COURSE);
    courseRepository.remove.mockResolvedValue(SAMPLE_COURSE);

    await deleteCourse("course-1");

    expect(courseRepository.remove).toHaveBeenCalledWith("course-1");
  });

  it("throws 404 when course is not found", async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(deleteCourse("missing")).rejects.toMatchObject({
      message: "Course not found",
      statusCode: 404,
    });
    expect(courseRepository.remove).not.toHaveBeenCalled();
  });
});
