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
    const dateFilter = from && to ? { createdAt: { gte: new Date(from), lte: new Date(to) } } : {};

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

    return Response.json({ success: true, data: recent });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "Recent activity failed" }, { status: 500 });
  }
}
