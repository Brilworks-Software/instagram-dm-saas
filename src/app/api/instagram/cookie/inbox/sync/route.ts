import { NextRequest, NextResponse } from 'next/server';
import { instagramCookieService } from '@/lib/server/instagram/cookie-service';
import { prisma } from '@/lib/server/prisma/client';
import type { InstagramCookies } from '@/lib/server/instagram/types';

export async function POST(request: NextRequest) {
  try {
    const { cookies, accountId, workspaceId } = await request.json() as {
      cookies: InstagramCookies;
      accountId: string;
      workspaceId?: string;
    };

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return NextResponse.json(
        { success: false, error: 'Invalid cookies provided' },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'accountId is required' },
        { status: 400 }
      );
    }

    const finalWorkspaceId = workspaceId || '11111111-1111-1111-1111-111111111111';
    
    // Get inbox threads from Instagram
    const threads = await instagramCookieService.getInbox(cookies, 20);
    
    let syncedConversations = 0;
    let syncedMessages = 0;

    for (const thread of threads) {
      try {
        // Get the other user (not self)
        const otherUser = thread.users[0];
        if (!otherUser) continue;

        // Create or update contact
        const contact = await prisma.contact.upsert({
          where: {
            igUserId_workspaceId: {
              igUserId: otherUser.pk,
              workspaceId: finalWorkspaceId,
            },
          },
          create: {
            workspaceId: finalWorkspaceId,
            igUserId: otherUser.pk,
            igUsername: otherUser.username,
            name: otherUser.fullName,
            profilePictureUrl: otherUser.profilePicUrl,
          },
          update: {
            igUsername: otherUser.username,
            name: otherUser.fullName,
            profilePictureUrl: otherUser.profilePicUrl,
          },
        });

        // Create or update conversation
        const conversation = await prisma.conversation.upsert({
          where: {
            instagramAccountId_contactId: {
              instagramAccountId: accountId,
              contactId: contact.id,
            },
          },
          create: {
            instagramAccountId: accountId,
            contactId: contact.id,
            status: 'OPEN',
            lastMessageAt: new Date(thread.lastActivity).toISOString(),
            unreadCount: thread.unreadCount,
          },
          update: {
            lastMessageAt: new Date(thread.lastActivity).toISOString(),
            unreadCount: thread.unreadCount,
          },
        });

        syncedConversations++;

        // Fetch and sync messages for this thread
        const messages = await instagramCookieService.getThreadMessages(
          cookies,
          thread.threadId,
          30
        );

        for (const msg of messages) {
          if (!msg.text) continue;

          // Check if message already exists
          const existing = await prisma.message.findFirst({
            where: {
              conversationId: conversation.id,
              igMessageId: msg.itemId,
            },
          });

          if (!existing) {
            // Determine if this is from us or from them
            const isFromUs = msg.userId === cookies.dsUserId;

            await prisma.message.create({
              data: {
                conversationId: conversation.id,
                igMessageId: msg.itemId,
                content: msg.text,
                messageType: 'TEXT',
                direction: isFromUs ? 'OUTBOUND' : 'INBOUND',
                status: 'DELIVERED',
                sentAt: new Date(msg.timestamp).toISOString(),
                createdAt: new Date(msg.timestamp).toISOString(),
              },
            });

            syncedMessages++;
          }
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (threadError: any) {
        console.error(`Error syncing thread ${thread.threadId}:`, threadError);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      syncedConversations,
      syncedMessages,
    });
  } catch (error: any) {
    console.error('Error syncing inbox:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync inbox',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

