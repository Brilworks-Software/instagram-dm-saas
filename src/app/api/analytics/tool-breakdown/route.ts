/**
 * Analytics Tool Breakdown API
 * Returns usage count breakdown by tool type, sorted by most used.
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

    const toolBreakdownRaw = await prisma.toolUsage.groupBy({
      by: ["toolType"],
      _count: { toolType: true },
      where: dateFilter,
      orderBy: { _count: { toolType: "desc" } },
    });
    const toolBreakdown = toolBreakdownRaw.map(t => ({ toolType: t.toolType, total: t._count.toolType }));

    return Response.json({ success: true, data: toolBreakdown });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Tool breakdown failed" }, { status: 500 });
  }
}
