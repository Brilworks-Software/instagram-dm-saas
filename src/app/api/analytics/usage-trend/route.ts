/**
 * Analytics Usage Trend API
 * Returns daily usage trend data (date and total usage count per day).
 * Query params: from, to (optional date range)
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma/client";
import { requireAuth } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const usageTrend = from && to
      ? await prisma.$queryRaw`
          SELECT date_trunc('day', created_at) AS day, COUNT(*)::int AS total
          FROM tool_usage
          WHERE created_at BETWEEN ${new Date(from)} AND ${new Date(to)}
          GROUP BY day
          ORDER BY day ASC
        `
      : await prisma.$queryRaw`
          SELECT date_trunc('day', created_at) AS day, COUNT(*)::int AS total
          FROM tool_usage
          GROUP BY day
          ORDER BY day ASC
        `;

    return Response.json({ success: true, data: usageTrend });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Usage trend failed" }, { status: 500 });
  }
}
