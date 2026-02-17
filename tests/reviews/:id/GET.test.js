import { GET } from "@/app/api/v1/reviews/[id]/route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, status: init?.status ?? 200 })),
  },
}));

describe("GET /api/v1/reviews/:id", () => {
  it("returns 501 Not Implemented", async () => {
    const response = await GET({}, { params: { id: "some-id" } });

    expect(response.status).toBe(501);
    expect(response.body).toEqual({ message: "Not implemented" });
  });
});
