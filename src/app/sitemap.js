import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.APP_URL || "https://infocampus.com.br";

  let universities = [];
  try {
    universities = await prisma.university.findMany({
      select: { id: true, slug: true, createdAt: true },
    });
  } catch {
    // Fallback if slug column doesn't exist yet (before migration)
    universities = await prisma.university.findMany({
      select: { id: true, createdAt: true },
    });
  }

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre/avaliacoes-externas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const universityRoutes = universities.map((university) => ({
    url: university.slug
      ? `${baseUrl}/universidades/${university.slug}`
      : `${baseUrl}/universities/${university.id}`,
    lastModified: university.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...universityRoutes];
}
