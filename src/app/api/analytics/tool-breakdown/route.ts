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
    const country = searchParams.get("country");

    // Use raw SQL for accurate JSON filtering
    let toolBreakdownRaw;
    if (from && to && country) {
      toolBreakdownRaw = await prisma.$queryRaw`
        SELECT tool_type as toolType, COUNT(*)::int as total
        FROM tool_usage
        WHERE created_at BETWEEN ${new Date(from)} AND ${new Date(to)}
          AND location->>'country_name' = ${country}
        GROUP BY tool_type
        ORDER BY total DESC
      `;
    } else if (from && to) {
      toolBreakdownRaw = await prisma.$queryRaw`
        SELECT tool_type as toolType, COUNT(*)::int as total
        FROM tool_usage
        WHERE created_at BETWEEN ${new Date(from)} AND ${new Date(to)}
        GROUP BY tool_type
        ORDER BY total DESC
      `;
    } else if (country) {
      toolBreakdownRaw = await prisma.$queryRaw`
        SELECT tool_type as toolType, COUNT(*)::int as total
        FROM tool_usage
        WHERE location->>'country_name' = ${country}
        GROUP BY tool_type
        ORDER BY total DESC
      `;
    } else {
      toolBreakdownRaw = await prisma.toolUsage.groupBy({
        by: ["toolType"],
        _count: { toolType: true },
        orderBy: { _count: { toolType: "desc" } },
      });
    }
    const toolBreakdown = Array.isArray(toolBreakdownRaw) && toolBreakdownRaw.length > 0 && 'total' in toolBreakdownRaw[0]
      ? toolBreakdownRaw.map((t: any) => ({ toolType: t.tooltype, total: t.total }))
      : (toolBreakdownRaw as any[]).map((t) => ({ toolType: t.toolType, total: t._count.toolType }));
    console.log('toolBreakdown', toolBreakdown);

    return Response.json({ success: true, data: toolBreakdown });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Tool breakdown failed" }, { status: 500 });
  }
}
