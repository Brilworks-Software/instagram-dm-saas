/**
 * Analytics Overview API
 * Returns total usage count, unique Instagram IDs, and number of unique tool types used.
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
    const country = searchParams.get("country");

    // Use raw SQL for accurate filtering with JSON fields
    let totalUsage: number;
    let uniqueInstaIds: number;
    let toolTypes: number;

    if (from && to && country) {
      const [totalResult, uniqueResult, toolResult] = await Promise.all([
        prisma.$queryRaw`SELECT COUNT(*)::int as count FROM tool_usage WHERE created_at BETWEEN ${new Date(from)} AND ${new Date(to)} AND location->>'country_name' = ${country}`,
        prisma.$queryRaw`SELECT COUNT(DISTINCT insta_id)::int as count FROM tool_usage WHERE created_at BETWEEN ${new Date(from)} AND ${new Date(to)} AND location->>'country_name' = ${country} AND insta_id IS NOT NULL`,
        prisma.$queryRaw`SELECT COUNT(DISTINCT tool_type)::int as count FROM tool_usage WHERE location->>'country_name' = ${country}`
      ]);
      totalUsage = Number((totalResult as any)[0]?.count || 0);
      uniqueInstaIds = Number((uniqueResult as any)[0]?.count || 0);
      toolTypes = Number((toolResult as any)[0]?.count || 0);
    } else if (from && to) {
      const dateFilter = { createdAt: { gte: new Date(from), lte: new Date(to) } };
      const [total, unique, tool] = await Promise.all([
        prisma.toolUsage.count({ where: dateFilter }),
        prisma.toolUsage.findMany({ where: { ...dateFilter, instaId: { not: null } }, distinct: ["instaId"], select: { instaId: true } }).then(rows => rows.length),
        prisma.toolUsage.findMany({ distinct: ["toolType"], select: { toolType: true } }).then(rows => rows.length)
      ]);
      totalUsage = total;
      uniqueInstaIds = unique;
      toolTypes = tool;
    } else if (country) {
      const [totalResult, uniqueResult, toolResult] = await Promise.all([
        prisma.$queryRaw`SELECT COUNT(*)::int as count FROM tool_usage WHERE location->>'country_name' = ${country}`,
        prisma.$queryRaw`SELECT COUNT(DISTINCT insta_id)::int as count FROM tool_usage WHERE location->>'country_name' = ${country} AND insta_id IS NOT NULL`,
        prisma.$queryRaw`SELECT COUNT(DISTINCT tool_type)::int as count FROM tool_usage WHERE location->>'country_name' = ${country}`
      ]);
      totalUsage = Number((totalResult as any)[0]?.count || 0);
      uniqueInstaIds = Number((uniqueResult as any)[0]?.count || 0);
      toolTypes = Number((toolResult as any)[0]?.count || 0);
    } else {
      const [total, unique, tool] = await Promise.all([
        prisma.toolUsage.count(),
        prisma.toolUsage.findMany({ where: { instaId: { not: null } }, distinct: ["instaId"], select: { instaId: true } }).then(rows => rows.length),
        prisma.toolUsage.findMany({ distinct: ["toolType"], select: { toolType: true } }).then(rows => rows.length)
      ]);
      totalUsage = total;
      uniqueInstaIds = unique;
      toolTypes = tool;
    }

    return Response.json({ success: true, data: { totalUsage, uniqueInstaIds, toolTypes } });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Overview failed" }, { status: 500 });
  }
}
