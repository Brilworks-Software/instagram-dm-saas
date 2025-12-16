import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  InstagramCookieService,
  InstagramCookies,
  SendDMRequest,
} from './instagram-cookie.service';
import { InstagramBrowserService } from './instagram-browser.service';

// ============================================================================
// DTOs
// ============================================================================

interface ConnectWithCookiesDto {
  cookies: InstagramCookies;
  workspaceId?: string;
}

interface SendDMDto {
  cookies: InstagramCookies;
  recipientUsername: string;
  message: string;
}

interface SendDMByIdDto {
  cookies: InstagramCookies;
  recipientUserId: string;
  message: string;
}

interface BulkSendDMDto {
  cookies: InstagramCookies;
  recipients: Array<{
    username?: string;
    userId?: string;
  }>;
  message: string;
  delayMs?: number; // Delay between messages to avoid rate limits
}

interface SearchUsersDto {
  cookies: InstagramCookies;
  query: string;
  limit?: number;
}

// ============================================================================
// Controller
// ============================================================================

@Controller('instagram/cookie')
export class InstagramCookieController {
  private readonly logger = new Logger(InstagramCookieController.name);

  constructor(
    private readonly cookieService: InstagramCookieService,
    private readonly browserService: InstagramBrowserService,
  ) {}

  // ==========================================================================
  // Browser-based Auto Login
  // ==========================================================================

  /**
   * Starts automatic browser login.
   * Opens a browser window for the user to login to Instagram.
   * Cookies are automatically captured after successful login.
   */
  @Post('browser/login')
  @HttpCode(HttpStatus.OK)
  async startBrowserLogin(@Body() body: { workspaceId?: string }) {
    const workspaceId = body.workspaceId || '11111111-1111-1111-1111-111111111111';
    
    this.logger.log(`Starting browser login for workspace ${workspaceId}`);
    
    const result = await this.browserService.startBrowserLogin(workspaceId);
    
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Checks the status of a browser login session.
   */
  @Get('browser/status/:sessionId')
  async getBrowserLoginStatus(@Param('sessionId') sessionId: string) {
    const session = this.browserService.getSessionStatus(sessionId);
    
    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }

    return {
      success: true,
      session,
    };
  }

  /**
   * Cancels a browser login session.
   */
  @Post('browser/cancel/:sessionId')
  @HttpCode(HttpStatus.OK)
  async cancelBrowserLogin(@Param('sessionId') sessionId: string) {
    await this.browserService.cancelSession(sessionId);
    
    return {
      success: true,
      message: 'Session cancelled',
    };
  }

  /**
   * Quick check for existing Instagram session.
   * Attempts to use cookies from already logged-in browser.
   */
  @Post('browser/check-existing')
  @HttpCode(HttpStatus.OK)
  async checkExistingSession(@Body() body: { workspaceId?: string }) {
    const workspaceId = body.workspaceId || '11111111-1111-1111-1111-111111111111';
    
    this.logger.log('Checking for existing Instagram session...');
    
    const result = await this.browserService.checkExistingSession(workspaceId);
    
    return {
      success: result.found,
      ...result,
    };
  }

  // ==========================================================================
  // Authentication
  // ==========================================================================

  /**
   * Verifies Instagram session cookies and returns user info.
   * Use this to test if cookies are valid before saving.
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyCookies(@Body() body: { cookies: InstagramCookies }) {
    try {
      this.logger.log('Verifying Instagram cookies...');

      if (!body.cookies || !body.cookies.sessionId || !body.cookies.dsUserId) {
        this.logger.warn('Invalid cookies provided - missing required fields');
        return {
          success: false,
          error: 'Invalid cookies. Missing sessionId or dsUserId. Please make sure you are logged in to Instagram.',
          message: 'Invalid cookies. Missing sessionId or dsUserId.',
        };
      }

      const userInfo = await this.cookieService.verifySession(body.cookies);

      return {
        success: true,
        user: userInfo,
      };
    } catch (error: any) {
      this.logger.error('Error verifying cookies:', error);
      
      // Handle NestJS exceptions
      const errorMessage = error?.response?.message || error?.message || 'Failed to verify Instagram session';
      const statusCode = error?.status || error?.statusCode || 400;
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  }

  /**
   * Connects an Instagram account using browser cookies.
   * Saves the account to the workspace for future use.
   */
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  async connectWithCookies(@Body() body: ConnectWithCookiesDto) {
    const workspaceId = body.workspaceId || '11111111-1111-1111-1111-111111111111';

    this.logger.log(`Connecting Instagram account to workspace ${workspaceId}`);

    // Verify cookies first
    const userInfo = await this.cookieService.verifySession(body.cookies);

    // Try to save to database (but don't fail if DB is unavailable)
    let savedAccountId = `cookie_${userInfo.pk}`;
    try {
      const savedAccount = await this.cookieService.saveAccountWithCookies(
        workspaceId,
        body.cookies,
        userInfo
      );
      savedAccountId = savedAccount.id;
      this.logger.log(`Account saved to database with ID: ${savedAccountId}`);
    } catch (dbError) {
      this.logger.warn(`Database unavailable, account verified but not persisted: ${(dbError as Error).message}`);
    }

    // Return success with account info (works even without DB)
    return {
      success: true,
      account: {
        id: savedAccountId,
        pk: userInfo.pk,
        username: userInfo.username,
        fullName: userInfo.fullName,
        profilePicUrl: userInfo.profilePicUrl,
        isPrivate: userInfo.isPrivate,
      },
      // Include cookies for frontend to store locally
      cookiesEncrypted: Buffer.from(JSON.stringify(body.cookies)).toString('base64'),
    };
  }

  // ==========================================================================
  // Direct Messages
  // ==========================================================================

  /**
   * Sends a DM to a user by their username.
   */
  @Post('dm/send')
  @HttpCode(HttpStatus.OK)
  async sendDM(@Body() body: SendDMDto) {
    this.logger.log(`Sending DM to @${body.recipientUsername}`);

    const result = await this.cookieService.sendDM(body.cookies, {
      recipientUsername: body.recipientUsername,
      message: body.message,
    });

    return result;
  }

  /**
   * Sends a DM to a user by their Instagram user ID.
   */
  @Post('dm/send-by-id')
  @HttpCode(HttpStatus.OK)
  async sendDMById(@Body() body: SendDMByIdDto) {
    this.logger.log(`Sending DM to user ID ${body.recipientUserId}`);

    const result = await this.cookieService.sendDMByUserId(
      body.cookies,
      body.recipientUserId,
      body.message
    );

    return result;
  }

  /**
   * Sends DMs to multiple users (with rate limit handling).
   */
  @Post('dm/bulk-send')
  @HttpCode(HttpStatus.OK)
  async bulkSendDM(@Body() body: BulkSendDMDto) {
    const delayMs = body.delayMs || 3000; // Default 3 second delay
    const results: Array<{ recipient: string; success: boolean; error?: string }> = [];

    this.logger.log(`Starting bulk DM to ${body.recipients.length} recipients`);

    for (const recipient of body.recipients) {
      try {
        let result;

        if (recipient.userId) {
          result = await this.cookieService.sendDMByUserId(
            body.cookies,
            recipient.userId,
            body.message
          );
        } else if (recipient.username) {
          result = await this.cookieService.sendDM(body.cookies, {
            recipientUsername: recipient.username,
            message: body.message,
          });
        } else {
          results.push({
            recipient: 'unknown',
            success: false,
            error: 'No username or userId provided',
          });
          continue;
        }

        results.push({
          recipient: recipient.username || recipient.userId || 'unknown',
          success: result.success,
          error: result.error,
        });

        // Add delay between messages to avoid rate limits
        if (body.recipients.indexOf(recipient) < body.recipients.length - 1) {
          await this.delay(delayMs);
        }
      } catch (error) {
        results.push({
          recipient: recipient.username || recipient.userId || 'unknown',
          success: false,
          error: (error as Error).message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(`Bulk DM completed: ${successCount}/${results.length} successful`);

    return {
      totalSent: results.length,
      successful: successCount,
      failed: results.length - successCount,
      results,
    };
  }

  // ==========================================================================
  // Inbox & Conversations
  // ==========================================================================

  /**
   * Fetches the user's DM inbox.
   */
  @Post('inbox')
  @HttpCode(HttpStatus.OK)
  async getInbox(@Body() body: { cookies: InstagramCookies; limit?: number }) {
    this.logger.log('Fetching inbox...');

    const threads = await this.cookieService.getInbox(body.cookies, body.limit || 20);

    return {
      success: true,
      threads,
      count: threads.length,
    };
  }

  /**
   * Fetches messages from a specific thread.
   */
  @Post('thread/:threadId/messages')
  @HttpCode(HttpStatus.OK)
  async getThreadMessages(
    @Param('threadId') threadId: string,
    @Body() body: { cookies: InstagramCookies; limit?: number }
  ) {
    this.logger.log(`Fetching messages from thread ${threadId}`);

    const messages = await this.cookieService.getThreadMessages(
      body.cookies,
      threadId,
      body.limit || 50
    );

    return {
      success: true,
      threadId,
      messages,
      count: messages.length,
    };
  }

  /**
   * Marks a thread as seen/read.
   */
  @Post('thread/:threadId/seen')
  @HttpCode(HttpStatus.OK)
  async markThreadAsSeen(
    @Param('threadId') threadId: string,
    @Body() body: { cookies: InstagramCookies }
  ) {
    await this.cookieService.markThreadAsSeen(body.cookies, threadId);

    return { success: true };
  }

  /**
   * Syncs Instagram inbox to database.
   * Fetches conversations and messages from Instagram and saves them.
   */
  @Post('inbox/sync')
  @HttpCode(HttpStatus.OK)
  async syncInbox(@Body() body: { cookies: InstagramCookies; accountId: string; workspaceId?: string }) {
    this.logger.log('Starting inbox sync...');

    try {
      const workspaceId = body.workspaceId || '11111111-1111-1111-1111-111111111111';
      
      // Get inbox threads from Instagram
      const threads = await this.cookieService.getInbox(body.cookies, 20);
      
      let syncedConversations = 0;
      let syncedMessages = 0;

      // Import PrismaService for database operations
      const { PrismaService } = await import('../prisma/prisma.service');
      const prisma = new PrismaService();

      for (const thread of threads) {
        try {
          // Get the other user (not self)
          const otherUser = thread.users[0]; // Assuming first user is the contact
          if (!otherUser) continue;

          // Create or update contact
          const contact = await prisma.contact.upsert({
            where: {
              igUserId_workspaceId: {
                igUserId: otherUser.pk,
                workspaceId: workspaceId,
              },
            },
            create: {
              workspaceId: workspaceId,
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
                instagramAccountId: body.accountId,
                contactId: contact.id,
              },
            },
            create: {
              instagramAccountId: body.accountId,
              contactId: contact.id,
              status: 'OPEN',
              lastMessageAt: new Date(thread.lastActivityAt).toISOString(),
              unreadCount: thread.unreadCount,
            },
            update: {
              lastMessageAt: new Date(thread.lastActivityAt).toISOString(),
              unreadCount: thread.unreadCount,
            },
          });

          syncedConversations++;

          // Fetch and sync messages for this thread
          const messages = await this.cookieService.getThreadMessages(
            body.cookies,
            thread.threadId,
            30
          );

          for (const msg of messages) {
            if (!msg.text) continue; // Skip non-text messages for now

            // Check if message already exists
            const existing = await prisma.message.findFirst({
              where: {
                conversationId: conversation.id,
                igMessageId: msg.itemId,
              },
            });

            if (!existing) {
              // Determine if this is from us or from them
              const isFromUs = msg.userId === body.cookies.dsUserId;

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
          await this.delay(200);
        } catch (threadError) {
          this.logger.error(`Error syncing thread ${thread.threadId}: ${(threadError as Error).message}`);
          continue;
        }
      }

      await prisma.$disconnect();

      this.logger.log(`Inbox sync complete: ${syncedConversations} conversations, ${syncedMessages} messages`);

      return {
        success: true,
        syncedConversations,
        syncedMessages,
      };
    } catch (error) {
      this.logger.error(`Inbox sync failed: ${(error as Error).message}`);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // ==========================================================================
  // User Search
  // ==========================================================================

  /**
   * Gets user info by username.
   */
  @Post('user/:username')
  @HttpCode(HttpStatus.OK)
  async getUserByUsername(
    @Param('username') username: string,
    @Body() body: { cookies: InstagramCookies }
  ) {
    const user = await this.cookieService.getUserByUsername(body.cookies, username);

    if (!user) {
      return {
        success: false,
        error: `User @${username} not found`,
      };
    }

    return {
      success: true,
      user,
    };
  }

  /**
   * Searches for users by query.
   */
  @Post('users/search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(@Body() body: SearchUsersDto) {
    const users = await this.cookieService.searchUsers(
      body.cookies,
      body.query,
      body.limit || 10
    );

    return {
      success: true,
      users,
      count: users.length,
    };
  }

  // ==========================================================================
  // Lead Scraping
  // ==========================================================================

  /**
   * Gets detailed user profile including bio.
   */
  @Post('user/:username/profile')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(
    @Param('username') username: string,
    @Body() body: { cookies: InstagramCookies }
  ) {
    this.logger.log(`Getting full profile for @${username}`);
    
    const profile = await this.cookieService.getUserProfileByUsername(body.cookies, username);

    if (!profile) {
      return {
        success: false,
        error: `User @${username} not found or profile unavailable`,
      };
    }

    return {
      success: true,
      profile,
    };
  }

  /**
   * Gets followers of a user for lead scraping.
   */
  @Post('user/:userId/followers')
  @HttpCode(HttpStatus.OK)
  async getUserFollowers(
    @Param('userId') userId: string,
    @Body() body: { cookies: InstagramCookies; limit?: number }
  ) {
    this.logger.log(`Getting followers for user ${userId}`);

    const followers = await this.cookieService.getUserFollowers(
      body.cookies,
      userId,
      body.limit || 50
    );

    return {
      success: true,
      followers,
      count: followers.length,
    };
  }

  /**
   * Gets following of a user for lead scraping.
   */
  @Post('user/:userId/following')
  @HttpCode(HttpStatus.OK)
  async getUserFollowing(
    @Param('userId') userId: string,
    @Body() body: { cookies: InstagramCookies; limit?: number }
  ) {
    this.logger.log(`Getting following for user ${userId}`);

    const following = await this.cookieService.getUserFollowing(
      body.cookies,
      userId,
      body.limit || 50
    );

    return {
      success: true,
      following,
      count: following.length,
    };
  }

  /**
   * Gets users from a hashtag for lead scraping.
   * Supports different search sources: 'posts', 'bio', or 'both'
   */
  @Post('hashtag/:hashtag/users')
  @HttpCode(HttpStatus.OK)
  async getHashtagUsers(
    @Param('hashtag') hashtag: string,
    @Body() body: { 
      cookies: InstagramCookies; 
      limit?: number;
      searchSource?: 'posts' | 'bio' | 'both';
      bioKeywords?: string[];
    }
  ) {
    const searchSource = body.searchSource || 'posts';
    this.logger.log(`Getting users from hashtag #${hashtag} (source: ${searchSource})`);

    try {
      const result = await this.cookieService.searchByKeyword(
        body.cookies,
        hashtag,
        searchSource,
        body.limit || 50,
        body.bioKeywords
      );

      this.logger.log(`Found ${result.users.length} users from hashtag #${hashtag} (source: ${searchSource})`);

      return {
        success: true,
        hashtag,
        searchSource,
        users: result.users,
        count: result.users.length,
      };
    } catch (error) {
      this.logger.error(`Error getting hashtag users: ${(error as Error).message}`);
      return {
        success: false,
        hashtag,
        searchSource,
        users: [],
        count: 0,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Debug endpoint to test hashtag post structure
   */
  @Post('hashtag/:hashtag/debug')
  @HttpCode(HttpStatus.OK)
  async debugHashtag(
    @Param('hashtag') hashtag: string,
    @Body() body: { cookies: InstagramCookies }
  ) {
    try {
      const ig = await this.cookieService['getClient'](body.cookies);
      const cleanHashtag = hashtag.replace(/^#/, '');
      const hashtagFeed = ig.feed.tag(cleanHashtag);
      const page = await hashtagFeed.items();
      
      if (page.length === 0) {
        return {
          success: false,
          message: 'No posts found',
          posts: [],
        };
      }
      
      // Get first post structure
      const firstPost = page[0] as any;
      const postInfo: any = {
        keys: Object.keys(firstPost),
        hasUser: !!firstPost.user,
        hasOwner: !!firstPost.owner,
        userPk: firstPost.user_pk || null,
        userId: firstPost.user_id || null,
      };
      
      // Try to serialize user if exists
      if (firstPost.user) {
        try {
          if (typeof firstPost.user.toJSON === 'function') {
            postInfo.user = firstPost.user.toJSON();
          } else {
            postInfo.user = {
              pk: firstPost.user.pk,
              id: firstPost.user.id,
              username: firstPost.user.username,
              keys: Object.keys(firstPost.user),
            };
          }
        } catch (e) {
          postInfo.userError = (e as Error).message;
        }
      }
      
      return {
        success: true,
        postsFound: page.length,
        firstPost: postInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        stack: (error as Error).stack,
      };
    }
  }

  /**
   * Bulk fetch user profiles with bio for filtering.
   */
  @Post('users/profiles')
  @HttpCode(HttpStatus.OK)
  async getBulkUserProfiles(
    @Body() body: { cookies: InstagramCookies; userIds: string[] }
  ) {
    this.logger.log(`Bulk fetching ${body.userIds.length} profiles`);

    const profiles = await this.cookieService.getBulkUserProfiles(
      body.cookies,
      body.userIds
    );

    return {
      success: true,
      profiles,
      count: profiles.length,
    };
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

