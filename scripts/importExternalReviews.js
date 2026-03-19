/**
 * Import external reviews (Google Maps) into the database.
 *
 * Expected JSON format:
 * [
 *   {
 *     "universityName": "USP",
 *     "reviews": [
 *       { "rating": 5, "text": "Great university...", "url": "https://maps.google.com/...", "date": "2025-01-15" }
 *     ]
 *   }
 * ]
 *
 * Usage: node scripts/importExternalReviews.js [path/to/file.json]
 */

const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { join } = require("path");

const prisma = new PrismaClient();

const DEFAULT_FILE_PATH = join(__dirname, "..", "data", "external-reviews.json");

function truncateAtWordBoundary(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const cutPoint = lastSpaceIndex > 0 ? lastSpaceIndex : maxLength;
  return truncated.slice(0, cutPoint) + "...";
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

async function main() {
  const filePath = process.argv[2] || DEFAULT_FILE_PATH;
  console.log(`Reading external reviews from: ${filePath}`);

  const fileContents = readFileSync(filePath, "utf-8");
  const entries = JSON.parse(fileContents);

  console.log(`Found ${entries.length} university entries.\n`);

  let totalImported = 0;
  const skippedUniversities = [];

  for (const entry of entries) {
    const { universityName, reviews } = entry;

    if (!universityName || !Array.isArray(reviews)) {
      console.log(`  [SKIP] Invalid entry (missing universityName or reviews)`);
      continue;
    }

    const university = await prisma.university.findUnique({
      where: { name: universityName },
    });

    if (!university) {
      console.log(`  [SKIP] University not found: "${universityName}"`);
      skippedUniversities.push(universityName);
      continue;
    }

    const validReviews = reviews
      .filter((review) => isValidRating(review.rating) && review.url)
      .map((review) => ({
        rating: review.rating,
        textSnippet: truncateAtWordBoundary(review.text),
        sourceUrl: review.url,
        source: "GOOGLE_MAPS",
        originalDate: new Date(review.date || Date.now()),
        universityId: university.id,
      }));

    if (validReviews.length === 0) {
      console.log(`  [SKIP] No valid reviews for "${universityName}"`);
      continue;
    }

    const result = await prisma.externalReview.createMany({
      data: validReviews,
      skipDuplicates: true,
    });

    console.log(`  [IMPORTED] "${universityName}": ${result.count} reviews`);
    totalImported += result.count;
  }

  console.log(`\nDone. Imported: ${totalImported}`);
  if (skippedUniversities.length > 0) {
    console.log(`Skipped universities (not found): ${skippedUniversities.join(", ")}`);
  }
}

main()
  .catch((error) => {
    console.error("Import script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
