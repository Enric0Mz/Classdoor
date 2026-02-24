/**
 * Seed script to populate the UniversityDomain table from data/university-domains.json.
 *
 * This script matches university entries in the JSON file to University records in the DB
 * by name (exact match), then inserts a row for each domain.
 *
 * Usage: node scripts/seedUniversityDomains.js
 */

const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { join } = require("path");

const prisma = new PrismaClient();
const DOMAINS_FILE_PATH = join(__dirname, "..", "data", "university-domains.json");

async function main() {
  const fileContents = readFileSync(DOMAINS_FILE_PATH, "utf-8");
  const universityEntries = JSON.parse(fileContents);

  const brazilianUniversities = universityEntries.filter(
    (entry) => entry.country === "Brazil"
  );

  console.log(`Found ${brazilianUniversities.length} Brazilian universities in JSON file.`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const entry of brazilianUniversities) {
    const universityInDatabase = await prisma.university.findUnique({
      where: { name: entry.name },
    });

    if (!universityInDatabase) {
      console.log(`  [SKIP] University not found in DB: "${entry.name}"`);
      skippedCount++;
      continue;
    }

    for (const domain of entry.domains) {
      await prisma.universityDomain.upsert({
        where: { domain },
        update: { universityId: universityInDatabase.id },
        create: { domain, universityId: universityInDatabase.id },
      });

      console.log(`  [OK] Linked domain "${domain}" to "${universityInDatabase.name}"`);
      insertedCount++;
    }
  }

  console.log(`\nDone. Inserted/updated: ${insertedCount}, skipped (not in DB): ${skippedCount}`);
}

main()
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
