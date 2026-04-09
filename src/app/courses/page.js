import * as courseService from "@/domain/courseService";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/jsonLd";
import CoursesClient from "./CoursesClient";

export const metadata = {
  title: "Cursos Online para Universitários",
  description:
    "Cursos selecionados para alavancar sua carreira acadêmica e profissional. Programação, Design, Marketing, Data Science e mais.",
  openGraph: {
    title: "Cursos Online para Universitários | InfoCampus",
    description:
      "Cursos selecionados para alavancar sua carreira acadêmica e profissional.",
  },
};

export default async function CoursesPage() {
  const { data } = await courseService.listCourses({ skip: 0, take: 100 });

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Início", url: "/" },
    { name: "Cursos" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <CoursesClient initialCourses={data} />
    </>
  );
}
