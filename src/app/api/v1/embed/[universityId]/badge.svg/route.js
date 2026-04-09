import * as universityService from "@/domain/universityService";

export async function GET(request, { params }) {
  const { universityId } = await params;

  let university;
  try {
    university = await universityService.getUniversityById(universityId);
  } catch {
    return new Response("University not found", { status: 404 });
  }

  const rating = university.stats?.averageRating;
  const reviewCount = university.stats?.reviewCount ?? 0;
  const name =
    university.abbreviation || university.name.slice(0, 25) || "Universidade";
  const ratingText = rating != null ? rating.toFixed(1) : "N/A";
  const reviewText = `${reviewCount} ${reviewCount === 1 ? "avaliação" : "avaliações"}`;

  const nameWidth = Math.min(name.length * 8 + 20, 220);
  const ratingWidth = 60;
  const reviewWidth = reviewCount > 0 ? reviewText.length * 7 + 16 : 0;
  const brandWidth = 100;
  const totalWidth = nameWidth + ratingWidth + reviewWidth + brandWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" viewBox="0 0 ${totalWidth} 28">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
  </defs>
  <rect width="${totalWidth}" height="28" rx="6" fill="url(#bg)"/>

  <!-- University name -->
  <rect width="${nameWidth}" height="28" rx="6" fill="#1a1a2e"/>
  <text x="${nameWidth / 2}" y="18" fill="#e8e8e8" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="middle">${escapeXml(name)}</text>

  <!-- Rating -->
  <rect x="${nameWidth}" width="${ratingWidth}" height="28" fill="#c9b458"/>
  <text x="${nameWidth + ratingWidth / 2}" y="18" fill="#1a1a2e" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${escapeXml(ratingText)}</text>

  ${
    reviewWidth > 0
      ? `<!-- Reviews -->
  <rect x="${nameWidth + ratingWidth}" width="${reviewWidth}" height="28" fill="#0f3460"/>
  <text x="${nameWidth + ratingWidth + reviewWidth / 2}" y="18" fill="#c9b458" font-family="sans-serif" font-size="10" font-weight="500" text-anchor="middle">${escapeXml(reviewText)}</text>`
      : ""
  }

  <!-- Brand -->
  <rect x="${totalWidth - brandWidth}" width="${brandWidth}" height="28" rx="6" fill="#0a1628"/>
  <rect x="${totalWidth - brandWidth}" width="6" height="28" fill="#0a1628"/>
  <text x="${totalWidth - brandWidth / 2}" y="18" fill="rgba(255,255,255,0.6)" font-family="sans-serif" font-size="9" font-weight="500" text-anchor="middle">InfoCampus</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
