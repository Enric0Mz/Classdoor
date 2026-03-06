import { NextResponse } from "next/server";
import { processPendingReviews } from "@/domain/moderationQueueService";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await processPendingReviews();

  return NextResponse.json(stats);
}
