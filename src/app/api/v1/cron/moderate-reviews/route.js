import { NextResponse } from "next/server";
import { processPendingReviews } from "@/domain/moderationQueueService";
import { withErrorHandler } from "@/lib/errorHandler";

export const POST = withErrorHandler(async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await processPendingReviews();

  return NextResponse.json(stats);
});
