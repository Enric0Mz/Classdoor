import { POST } from "@/app/api/v1/reviews/route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

describe("POST /api/v1/reviews", () => {
  it("returns 501 Not Implemented", async () => {
    const response = await POST({});

    expect(response.status).toBe(501);
    expect(response.body).toEqual({ message: "Not implemented" });
  });
});
