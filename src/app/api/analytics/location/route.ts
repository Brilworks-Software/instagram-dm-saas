/**
 * Analytics Location API
 * Returns usage count breakdown by country, sorted by most used.
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

    const location = from && to
      ? await prisma.$queryRaw`
          SELECT location->>'country_name' AS country, COUNT(*)::int AS total
          FROM tool_usage
          WHERE location IS NOT NULL AND created_at BETWEEN ${new Date(from)} AND ${new Date(to)}
          GROUP BY country
          ORDER BY total DESC
        `
      : await prisma.$queryRaw`
          SELECT location->>'country_name' AS country, COUNT(*)::int AS total
          FROM tool_usage
          WHERE location IS NOT NULL
          GROUP BY country
          ORDER BY total DESC
        `;

    return Response.json({ success: true, data: location });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Location failed" }, { status: 500 });
  }
}
