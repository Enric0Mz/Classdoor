/**
 * Seed script to populate the University table from data/universities.json.
 *
 * Each entry is upserted by name — existing universities are updated with
 * the latest data from the file, new ones are created.
 *
 * Usage: node scripts/seedUniversities.js
 */

const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { join } = require("path");

const prisma = new PrismaClient();
const UNIVERSITIES_FILE_PATH = join(
  __dirname,
  "..",
  "data",
  "universities.json",
);

async function main() {
  const fileContents = readFileSync(UNIVERSITIES_FILE_PATH, "utf-8");
  const universityEntries = JSON.parse(fileContents);

  console.log(`Found ${universityEntries.length} universities in JSON file.`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const entry of universityEntries) {
    const { name, location, website, image, type, courses } = entry;

    if (!name || !location || !type) {
      console.log(
        `  [SKIP] Missing required fields (name, location, type) for entry: "${name ?? "unnamed"}"`,
      );
      continue;
    }

    const existingUniversity = await prisma.university.findUnique({
      where: { name },
    });

    await prisma.university.upsert({
      where: { name },
      update: { location, website, image, type, courses: courses ?? [] },
      create: { name, location, website, image, type, courses: courses ?? [] },
    });

    if (existingUniversity) {
      console.log(`  [UPDATED] "${name}"`);
      updatedCount++;
    } else {
      console.log(`  [CREATED] "${name}"`);
      createdCount++;
    }
  }

  console.log(`\nDone. Created: ${createdCount}, updated: ${updatedCount}`);
}

main()
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
