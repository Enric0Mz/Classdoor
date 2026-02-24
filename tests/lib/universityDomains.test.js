import { findUniversityByDomain } from "@/lib/universityDomains";
import * as fs from "fs";

jest.mock("fs");

const SAMPLE_UNIVERSITIES = [
  {
    name: "Universidade de São Paulo",
    domains: ["usp.br"],
    country: "Brazil",
  },
  {
    name: "Universidade Estadual de Campinas",
    domains: ["unicamp.br", "dac.unicamp.br"],
    country: "Brazil",
  },
];

beforeEach(() => {
  fs.readFileSync.mockReturnValue(JSON.stringify(SAMPLE_UNIVERSITIES));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("findUniversityByDomain", () => {
  it("returns the matching university entry for a known domain", () => {
    const result = findUniversityByDomain("usp.br");

    expect(result).not.toBeNull();
    expect(result.name).toBe("Universidade de São Paulo");
  });

  it("returns null for a domain that is not in the JSON file", () => {
    const result = findUniversityByDomain("gmail.com");

    expect(result).toBeNull();
  });

  it("returns null for an empty string domain", () => {
    const result = findUniversityByDomain("");

    expect(result).toBeNull();
  });

  it("matches a university that has multiple domains", () => {
    const result = findUniversityByDomain("dac.unicamp.br");

    expect(result).not.toBeNull();
    expect(result.name).toBe("Universidade Estadual de Campinas");
  });

  it("performs case-insensitive matching", () => {
    const result = findUniversityByDomain("USP.BR");

    expect(result).not.toBeNull();
    expect(result.name).toBe("Universidade de São Paulo");
  });
});
