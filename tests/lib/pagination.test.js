import { parsePagination, paginatedResponse } from "@/lib/pagination";

function makeSearchParams(queryString = "") {
  return new URLSearchParams(queryString);
}

describe("parsePagination", () => {
  it("returns defaults when no params are provided", () => {
    const result = parsePagination(makeSearchParams());

    expect(result).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("parses valid page and limit params", () => {
    const result = parsePagination(makeSearchParams("page=3&limit=20"));

    expect(result).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it("falls back to defaults when page is 0 or negative", () => {
    expect(parsePagination(makeSearchParams("page=0")).page).toBe(1);
    expect(parsePagination(makeSearchParams("page=-5")).page).toBe(1);
  });

  it("falls back to defaults when limit is 0 or negative", () => {
    expect(parsePagination(makeSearchParams("limit=0")).limit).toBe(10);
    expect(parsePagination(makeSearchParams("limit=-1")).limit).toBe(10);
  });

  it("falls back to defaults when params are non-numeric strings", () => {
    const result = parsePagination(makeSearchParams("page=abc&limit=xyz"));

    expect(result).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("caps limit at 100", () => {
    const result = parsePagination(makeSearchParams("limit=500"));

    expect(result.limit).toBe(100);
  });

  it("computes skip correctly", () => {
    expect(parsePagination(makeSearchParams("page=1&limit=10")).skip).toBe(0);
    expect(parsePagination(makeSearchParams("page=2&limit=10")).skip).toBe(10);
    expect(parsePagination(makeSearchParams("page=5&limit=25")).skip).toBe(100);
  });
});

describe("paginatedResponse", () => {
  it("builds the correct response shape", () => {
    const data = [{ id: "a" }, { id: "b" }];
    const result = paginatedResponse(data, 25, 2, 10);

    expect(result).toEqual({
      data: [{ id: "a" }, { id: "b" }],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    });
  });

  it("computes totalPages correctly", () => {
    expect(paginatedResponse([], 0, 1, 10).pagination.totalPages).toBe(0);
    expect(paginatedResponse([], 10, 1, 10).pagination.totalPages).toBe(1);
    expect(paginatedResponse([], 11, 1, 10).pagination.totalPages).toBe(2);
    expect(paginatedResponse([], 100, 1, 10).pagination.totalPages).toBe(10);
  });
});
