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
    const dateFilter = from && to ? { createdAt: { gte: new Date(from), lte: new Date(to) } } : {};

    const [totalUsage, uniqueInstaIds, toolTypes] = await Promise.all([
      prisma.toolUsage.count({ where: dateFilter }),
      prisma.toolUsage.findMany({
        where: { ...dateFilter, instaId: { not: null } },
        distinct: ["instaId"],
        select: { instaId: true },
      }).then(rows => rows.length),
      prisma.toolUsage.findMany({
        distinct: ["toolType"],
        select: { toolType: true },
      }).then(rows => rows.length),
    ]);

    return Response.json({ success: true, data: { totalUsage, uniqueInstaIds, toolTypes } });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Overview failed" }, { status: 500 });
  }
}
