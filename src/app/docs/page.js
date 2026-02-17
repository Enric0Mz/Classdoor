import swaggerSpec from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default function DocsPage() {
  return (
    <section>
      <ReactSwagger spec={swaggerSpec} />
    </section>
  );
}
