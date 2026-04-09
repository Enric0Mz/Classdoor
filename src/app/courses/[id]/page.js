import { notFound } from "next/navigation";
import * as courseService from "@/domain/courseService";
import JsonLd from "@/components/JsonLd";
import { buildCourseSchema, buildBreadcrumbSchema } from "@/lib/jsonLd";
import CourseDetailClient from "./CourseDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const course = await courseService.getCourseById(id);
    const priceText =
      course.price != null ? `R$ ${course.price.toFixed(2)}` : "Gratuito";

    return {
      title: course.title,
      description: `${course.description.slice(0, 150)}. ${priceText}.`,
      openGraph: {
        title: `${course.title} | InfoCampus`,
        description: course.description.slice(0, 150),
        images: course.image ? [{ url: course.image }] : [],
      },
    };
  } catch {
    return {
      title: "Curso não encontrado",
    };
  }
}

export default async function CourseDetailPage({ params }) {
  const { id } = await params;

  let course;
  try {
    course = await courseService.getCourseById(id);
  } catch {
    notFound();
  }

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Início", url: "/" },
    { name: "Cursos", url: "/courses" },
    { name: course.title },
  ]);

  return (
    <>
      <JsonLd data={buildCourseSchema(course)} />
      <JsonLd data={breadcrumbs} />
      <CourseDetailClient course={course} />
    </>
  );
}
