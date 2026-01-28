/**
 * Analytics Recent Activity API
 * Returns the 20 most recent tool usage records with details.
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
    let recent;
    if (from && to && country) {
      recent = await prisma.$queryRaw`
        SELECT id, tool_type as "toolType", insta_id as "instaId", created_at as "createdAt", location
        FROM tool_usage
        WHERE created_at BETWEEN ${new Date(from)} AND ${new Date(to)}
          AND location->>'country_name' = ${country}
        ORDER BY created_at DESC
        LIMIT 20
      `;
    } else if (from && to) {
      recent = await prisma.toolUsage.findMany({
        where: { createdAt: { gte: new Date(from), lte: new Date(to) } },
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
    } else if (country) {
      recent = await prisma.$queryRaw`
        SELECT id, tool_type as "toolType", insta_id as "instaId", created_at as "createdAt", location
        FROM tool_usage
        WHERE location->>'country_name' = ${country}
        ORDER BY created_at DESC
        LIMIT 20
      `;
    } else {
      recent = await prisma.toolUsage.findMany({
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
    }

    return Response.json({ success: true, data: recent });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Recent activity failed" }, { status: 500 });
  }
}
