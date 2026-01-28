

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma/client';

// GET /api/leads/user-list?search=&page=&pageSize=
export async function GET(request: NextRequest) {
	try {
		const auth = await requireAuth(request);
		if (auth instanceof Response) return auth;

		const { search = '', page = '1', pageSize = '20' } = Object.fromEntries(request.nextUrl.searchParams.entries());
		const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
		const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize as string, 10) || 20));

		// Build where clause for search
		const where: any = { workspaceId: auth.workspaceId };
		if (search) {
			where.OR = [
				{ igUsername: { contains: search, mode: 'insensitive' } },
				{ fullName: { contains: search, mode: 'insensitive' } },
			];
		}

		// Get total count for pagination
		const total = await prisma.lead.count({ where });

		// Get paginated leads
		const leads = await prisma.lead.findMany({
			where,
			select: {
				id: true,
				igUsername: true,
				fullName: true,
				profilePicUrl: true,
			},
			orderBy: { createdAt: 'desc' },
			skip: (pageNum - 1) * pageSizeNum,
			take: pageSizeNum,
		});

		return NextResponse.json({ success: true, leads, total, page: pageNum, pageSize: pageSizeNum });
	} catch (error: any) {
		console.error('Error fetching user leads:', error);
		return NextResponse.json(
			{ success: false, error: error.message || 'Failed to fetch user leads' },
			{ status: 500 }
		);
	}
}

// DELETE /api/leads/user-list?id=leadId
export async function DELETE(request: NextRequest) {
	try {
		const auth = await requireAuth(request);
		if (auth instanceof Response) return auth;

		const { id } = Object.fromEntries(request.nextUrl.searchParams.entries());
		if (!id) {
			return NextResponse.json({ success: false, error: 'Lead id required' }, { status: 400 });
		}

		// Only delete if lead belongs to workspace
		const lead = await prisma.lead.findUnique({ where: { id } });
		if (!lead || lead.workspaceId !== auth.workspaceId) {
			return NextResponse.json({ success: false, error: 'Lead not found or unauthorized' }, { status: 404 });
		}

		await prisma.lead.delete({ where: { id } });
		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting user lead:', error);
		return NextResponse.json(
			{ success: false, error: error.message || 'Failed to delete user lead' },
			{ status: 500 }
		);
	}
}
