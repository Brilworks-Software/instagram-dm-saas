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

    const dateFilter =
      from && to
        ? {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          }
        : {};

    /* ---------------- OVERVIEW ---------------- */
    const [
        totalUsage,
        uniqueInstaIds,
        toolTypes,
      ] = await Promise.all([
        prisma.toolUsage.count({ where: dateFilter }),
        prisma.toolUsage
          .findMany({
            where: { ...dateFilter, instaId: { not: null } },
            distinct: ["instaId"],
            select: { instaId: true },
          })
          .then((rows) => rows.length),
        prisma.toolUsage
          .findMany({
            distinct: ["toolType"],
            select: { toolType: true },
          })
          .then((rows) => rows.length),
      ]);

    /* ---------------- USAGE TREND ---------------- */
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

    /* ---------------- TOOL BREAKDOWN ---------------- */
    const toolBreakdownRaw = await prisma.toolUsage.groupBy({
      by: ["toolType"],
      _count: { toolType: true },
      where: dateFilter,
      orderBy: {
        _count: { toolType: "desc" },
      },
    });

    const toolBreakdown = toolBreakdownRaw.map(t => ({
      toolType: t.toolType,
      total: t._count.toolType,
    }));

    /* ---------------- LOCATION ---------------- */
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

    /* ---------------- RECENT ACTIVITY ---------------- */
    const recent = await prisma.toolUsage.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        toolType: true,
        instaId: true,
        createdAt: true,
        location: true,
      },
    });

    return Response.json({
      success: true,
      data: {
        overview: {
          totalUsage,
          uniqueInstaIds,
          toolTypes,
        },
        usageTrend,
        toolBreakdown,
        location,
        recent,
      },
    });
  } catch (error: any) {
    console.error("Analytics API failed:", error);
    return Response.json(
      { success: false, error: error?.message || "Analytics failed" },
      { status: 500 }
    );
  }
}
