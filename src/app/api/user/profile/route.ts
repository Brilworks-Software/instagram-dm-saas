/**
 * User Profile API
 * Returns authenticated user's profile details (id, email, name, contact info, bio, avatar, timestamps).
 * Method: GET
 */
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(user);
  } catch (error: any) {
    console.error('Failed to get user profile:', error);
    return Response.json(
      { error: error?.message || 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const body = await request.json();
    const { firstName, lastName, phone, timezone, bio, name, avatarUrl } = body;

    // Only allow updating own profile
    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(timezone !== undefined && { timezone }),
        ...(bio !== undefined && { bio }),
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        bio: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    return Response.json(
      { error: error?.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

