import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function POST(request) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
