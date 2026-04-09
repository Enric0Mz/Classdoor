const BASE_URL = process.env.APP_URL || "https://infocampus.com.br";

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "InfoCampus",
    url: BASE_URL,
    description:
      "Avaliações reais de universidades brasileiras feitas por alunos e ex-alunos.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildUniversitySchema(university) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: university.name,
    url: university.website || `${BASE_URL}/universities/${university.id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: university.location,
      addressCountry: "BR",
    },
  };

  if (university.rating !== null && university.rating !== undefined) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: university.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: university.reviewCount || 1,
    };
  }

  if (university.images?.length > 0) {
    schema.image = university.images[0].url;
  }

  return schema;
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  };
}

export function buildCourseSchema(course) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "InfoCampus",
    },
  };

  if (course.price !== null && course.price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      price: course.price,
      priceCurrency: "BRL",
    };
  } else {
    schema.isAccessibleForFree = true;
  }

  if (course.image) {
    schema.image = course.image;
  }

  return schema;
}
