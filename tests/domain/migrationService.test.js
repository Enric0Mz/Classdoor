import * as migrationService from "@/domain/migrationService";
import prisma from "@/lib/prisma";
import fs from "fs";

jest.mock("@/lib/prisma", () => ({
  $queryRaw: jest.fn(),
}));

jest.mock("fs", () => ({
  promises: {
    readdir: jest.fn(),
  },
}));

const APPLIED_MIGRATIONS = [
  { migration_name: "20260217232444_switch_to_postgres" },
  { migration_name: "20260218044512_add_university_fields" },
];

const ALL_MIGRATION_DIRS = [
  { name: "20260217232444_switch_to_postgres", isDirectory: () => true },
  { name: "20260218044512_add_university_fields", isDirectory: () => true },
  { name: "20260218232852_add_user_role", isDirectory: () => true },
];

beforeEach(() => jest.clearAllMocks());

describe("migrationService.getMigrations", () => {
  describe("with status=pending", () => {
    it("returns only pending migrations", async () => {
      fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
      prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

      const result = await migrationService.getMigrations("pending");

      expect(result.migrations).toEqual(["20260218232852_add_user_role"]);
      expect(result.total).toBe(1);
      expect(result.status).toBe("pending");
    });

    it("returns empty list when all migrations are applied", async () => {
      fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS.slice(0, 2));
      prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

      const result = await migrationService.getMigrations("pending");

      expect(result.migrations).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("with status=applied", () => {
    it("returns only applied migrations", async () => {
      fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
      prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

      const result = await migrationService.getMigrations("applied");

      expect(result.migrations).toEqual([
        "20260217232444_switch_to_postgres",
        "20260218044512_add_university_fields",
      ]);
      expect(result.total).toBe(2);
      expect(result.status).toBe("applied");
    });
  });

  describe("with no status filter", () => {
    it("defaults to applied migrations", async () => {
      fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
      prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

      const result = await migrationService.getMigrations();

      expect(result.migrations).toEqual([
        "20260217232444_switch_to_postgres",
        "20260218044512_add_university_fields",
      ]);
      expect(result.total).toBe(2);
      expect(result.status).toBe("applied");
    });
  });

  it("returns all migrations as pending when none are applied", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockResolvedValue([]);

    const result = await migrationService.getMigrations("pending");

    expect(result.total).toBe(3);
    expect(result.migrations).toHaveLength(3);
  });

  it("ignores non-directory entries like migration_lock.toml", async () => {
    const entriesWithFile = [
      ...ALL_MIGRATION_DIRS.slice(0, 2),
      { name: "migration_lock.toml", isDirectory: () => false },
    ];
    fs.promises.readdir.mockResolvedValue(entriesWithFile);
    prisma.$queryRaw.mockResolvedValue(APPLIED_MIGRATIONS);

    const result = await migrationService.getMigrations("pending");

    expect(result.migrations).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("throws when database query fails", async () => {
    fs.promises.readdir.mockResolvedValue(ALL_MIGRATION_DIRS);
    prisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    await expect(migrationService.getMigrations("pending")).rejects.toThrow(
      "DB error",
    );
  });
});
