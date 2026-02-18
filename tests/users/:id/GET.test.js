import { getUserById } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import { GET } from "@/app/api/v1/users/[id]/route";

jest.mock("@/repositories/userRepository", () => ({
  findById: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

beforeEach(() => jest.clearAllMocks());

describe("userService.getUserById", () => {
  it("returns user without password", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1", email: "test@test.com", password: "hashed", createdAt: new Date(),
    });

    const result = await getUserById("user-1");

    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("test@test.com");
  });

  it("throws 404 when user not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(getUserById("missing")).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });
});

describe("GET /api/v1/users/:id", () => {
  it("returns 200 with user", async () => {
    userRepository.findById.mockResolvedValue({
      id: "user-1", email: "test@test.com", password: "hashed", createdAt: "2024-01-01T00:00:00.000Z",
    });

    const response = await GET({}, { params: Promise.resolve({ id: "user-1" }) });

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty("password");
  });

  it("returns 404 when user not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    const response = await GET({}, { params: Promise.resolve({ id: "missing" }) });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { message: "User not found", statusCode: 404 },
    });
  });
});
