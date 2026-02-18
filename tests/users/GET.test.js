import { listUsers } from "@/domain/userService";
import * as userRepository from "@/repositories/userRepository";
import { GET } from "@/app/api/v1/users/route";

jest.mock("@/repositories/userRepository", () => ({
  findAll: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

const USERS = [
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", email: "a@test.com", createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", email: "b@test.com", createdAt: "2024-01-01T00:00:00.000Z" },
];

beforeEach(() => jest.clearAllMocks());

describe("userService.listUsers", () => {
  it("returns all users from the repository", async () => {
    userRepository.findAll.mockResolvedValue(USERS);

    const result = await listUsers();

    expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(USERS);
  });

  it("returns an empty array when no users exist", async () => {
    userRepository.findAll.mockResolvedValue([]);

    const result = await listUsers();

    expect(result).toEqual([]);
  });
});

describe("GET /api/v1/users", () => {
  it("returns 200 with the list of users", async () => {
    userRepository.findAll.mockResolvedValue(USERS);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(USERS);
  });

  it("returns 500 on unexpected repository error", async () => {
    userRepository.findAll.mockRejectedValue(new Error("DB down"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal server error", statusCode: 500 },
    });
  });
});
