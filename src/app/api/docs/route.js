import { NextResponse } from "next/server";
import swaggerSpec from "@/lib/swagger";

export async function GET() {
  console.log("Trigger Migratio");
  return NextResponse.json(swaggerSpec);
}
