import * as universityService from "@/domain/universityService";
import { paginatedResponse } from "@/lib/pagination";
import JsonLd from "@/components/JsonLd";
import { buildWebsiteSchema, buildBreadcrumbSchema } from "@/lib/jsonLd";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "InfoCampus — Avaliações Reais de Universidades Brasileiras",
  description:
    "Descubra as melhores universidades do Brasil com avaliações reais de alunos e ex-alunos. Compare rankings, notas e reviews antes de escolher onde estudar.",
  openGraph: {
    title: "InfoCampus — Avaliações Reais de Universidades Brasileiras",
    description:
      "Descubra as melhores universidades do Brasil com avaliações reais de alunos e ex-alunos.",
  },
};

const ITEMS_PER_PAGE = 15;

export default async function HomePage() {
  const { data, total } = await universityService.listUniversities({
    skip: 0,
    take: ITEMS_PER_PAGE,
  });

  const paginationData = paginatedResponse(
    data,
    total,
    1,
    ITEMS_PER_PAGE,
  ).pagination;

  return (
    <>
      <JsonLd data={buildWebsiteSchema()} />
      <HomeClient initialData={data} initialPagination={paginationData} />
    </>
  );
}
