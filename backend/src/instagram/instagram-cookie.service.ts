import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IgApiClient, DirectThreadEntity } from 'instagram-private-api';
import { PrismaService } from '../prisma/prisma.service';

// ============================================================================
// Types
// ============================================================================

export interface InstagramCookies {
  sessionId: string;
  csrfToken: string;
  dsUserId: string;
  igDid?: string;
  mid?: string;
  rur?: string;
}

export interface SendDMRequest {
  recipientUsername: string;
  message: string;
}

export interface SendDMResponse {
  success: boolean;
  threadId?: string;
  itemId?: string;
  error?: string;
}

export interface InstagramUserInfo {
  pk: string;
  username: string;
  fullName: string;
  profilePicUrl?: string;
  isPrivate: boolean;
  followerCount?: number;
  followingCount?: number;
}

export interface ConversationThread {
  threadId: string;
  threadTitle: string;
  lastActivityAt: number;
  isGroup: boolean;
  users: Array<{
    pk: string;
    username: string;
    fullName: string;
    profilePicUrl?: string;
  }>;
  lastMessage?: {
    text?: string;
    timestamp: number;
    userId: string;
  };
  unreadCount: number;
}

export interface ThreadMessage {
  itemId: string;
  userId: string;
  timestamp: number;
  itemType: string;
  text?: string;
  mediaUrl?: string;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class InstagramCookieService {
  private readonly logger = new Logger(InstagramCookieService.name);
  
  // Cache for authenticated clients (in production, use Redis)
  private clientCache: Map<string, { client: IgApiClient; expiresAt: number }> = new Map();
  
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // Authentication with Browser Cookies
  // ==========================================================================

  /**
   * Creates an authenticated Instagram client using browser cookies.
   * This bypasses the normal login flow by using existing session cookies.
   */
  async createClientFromCookies(cookies: InstagramCookies): Promise<IgApiClient> {
    const ig = new IgApiClient();
    
    // Generate device ID based on user ID (for consistency)
    ig.state.generateDevice(cookies.dsUserId);
    
    try {
      // Build cookie jar in the format expected by tough-cookie
      const cookieJar = {
        version: 'tough-cookie@4.1.3',
        storeType: 'MemoryCookieStore',
        rejectPublicSuffixes: true,
        enableLooseMode: true,
        cookies: [
          this.buildCookie('sessionid', cookies.sessionId, true),
          this.buildCookie('csrftoken', cookies.csrfToken, false),
          this.buildCookie('ds_user_id', cookies.dsUserId, false),
          ...(cookies.igDid ? [this.buildCookie('ig_did', cookies.igDid, false)] : []),
          ...(cookies.mid ? [this.buildCookie('mid', cookies.mid, false)] : []),
          ...(cookies.rur ? [this.buildCookie('rur', cookies.rur, false)] : []),
        ],
      };

      // Set the cookies directly into the client state
      await ig.state.deserializeCookieJar(JSON.stringify(cookieJar));

      // Verify the session is valid by fetching current user
      const currentUser = await ig.account.currentUser();
      this.logger.log(`Successfully authenticated as @${currentUser.username} (${currentUser.pk})`);
      
      // Cache the client
      this.clientCache.set(cookies.dsUserId, {
        client: ig,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes cache
      });

      return ig;
    } catch (error) {
      const errorMsg = (error as Error).message;
      this.logger.error(`Failed to authenticate with cookies: ${errorMsg}`);
      
      // Provide more specific error messages
      if (errorMsg.includes('checkpoint')) {
        throw new BadRequestException(
          'Instagram requires verification. Please open Instagram in your browser and complete any security checks.'
        );
      }
      if (errorMsg.includes('login_required')) {
        throw new BadRequestException(
          'Session expired. Please re-login to Instagram in your browser and try again.'
        );
      }
      
      throw new BadRequestException(
        'Failed to verify Instagram session. Please make sure you are logged in to Instagram and try again.'
      );
    }
  }

  /**
   * Builds a cookie object for the cookie jar
   */
  private buildCookie(key: string, value: string, httpOnly: boolean) {
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      key,
      value,
      expires,
      maxAge: 31536000,
      domain: 'instagram.com',
      path: '/',
      secure: true,
      httpOnly,
      extensions: [],
      hostOnly: false,
      creation: now,
      lastAccessed: now,
    };
  }

  /**
   * Gets or creates an authenticated client from cache or cookies.
   */
  async getClient(cookies: InstagramCookies): Promise<IgApiClient> {
    const cached = this.clientCache.get(cookies.dsUserId);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.client;
    }
    
    return this.createClientFromCookies(cookies);
  }

  // ==========================================================================
  // Verify Session & Get User Info
  // ==========================================================================

  /**
   * Verifies cookies and returns current user info.
   */
  async verifySession(cookies: InstagramCookies): Promise<InstagramUserInfo> {
    this.logger.log(`Verifying session for user ID: ${cookies.dsUserId}`);
    this.logger.debug(`Cookies received: sessionId=${cookies.sessionId?.substring(0, 10)}..., csrfToken=${cookies.csrfToken?.substring(0, 10)}...`);
    
    const ig = await this.createClientFromCookies(cookies);
    const currentUser = await ig.account.currentUser();
    
    this.logger.log(`Session verified for @${currentUser.username}`);
    
    return {
      pk: currentUser.pk.toString(),
      username: currentUser.username,
      fullName: currentUser.full_name,
      profilePicUrl: currentUser.profile_pic_url,
      isPrivate: currentUser.is_private,
    };
  }

  /**
   * Save Instagram account with cookies to database.
   */
  async saveAccountWithCookies(
    workspaceId: string,
    cookies: InstagramCookies,
    userInfo: InstagramUserInfo
  ): Promise<{ id: string; igUsername: string }> {
    // Encrypt cookies for storage
    const encryptedCookies = this.encryptCookies(cookies);

    const account = await this.prisma.instagramAccount.upsert({
      where: {
        igUserId_workspaceId: {
          igUserId: userInfo.pk,
          workspaceId,
        },
      },
      update: {
        igUsername: userInfo.username,
        accessToken: encryptedCookies, // Store encrypted cookies as "token"
        profilePictureUrl: userInfo.profilePicUrl,
        isActive: true,
        permissions: ['cookie_auth', 'dm_send', 'dm_read'],
        accessTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      create: {
        workspaceId,
        igUserId: userInfo.pk,
        igUsername: userInfo.username,
        fbPageId: `cookie_auth_${userInfo.pk}`, // Placeholder for cookie-based auth
        accessToken: encryptedCookies,
        profilePictureUrl: userInfo.profilePicUrl,
        permissions: ['cookie_auth', 'dm_send', 'dm_read'],
        accessTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    this.logger.log(`Saved Instagram account @${userInfo.username} to workspace ${workspaceId}`);

    return {
      id: account.id,
      igUsername: account.igUsername,
    };
  }

  // ==========================================================================
  // Direct Messages
  // ==========================================================================

  /**
   * Sends a DM to a user by username.
   */
  async sendDM(cookies: InstagramCookies, request: SendDMRequest): Promise<SendDMResponse> {
    try {
      const ig = await this.getClient(cookies);
      
      // First, get the user's ID from username
      const userId = await ig.user.getIdByUsername(request.recipientUsername);
      
      // Get or create a direct thread with this user
      const thread = ig.entity.directThread([userId.toString()]);
      
      // Send the message
      const result = await thread.broadcastText(request.message) as any;
      
      this.logger.log(`Sent DM to @${request.recipientUsername}: "${request.message.substring(0, 50)}..."`);
      
      return {
        success: true,
        threadId: result.thread_id || result.payload?.thread_id,
        itemId: result.item_id || result.payload?.item_id,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Failed to send DM: ${errorMessage}`);
      
      // Handle specific errors
      if (errorMessage.includes('User not found')) {
        return {
          success: false,
          error: `User @${request.recipientUsername} not found`,
        };
      }
      
      if (errorMessage.includes('feedback_required')) {
        return {
          success: false,
          error: 'Instagram has temporarily blocked messaging. Please try again later.',
        };
      }
      
      if (errorMessage.includes('login_required')) {
        return {
          success: false,
          error: 'Session expired. Please re-authenticate with fresh cookies.',
        };
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sends a DM to a user by their Instagram user ID.
   */
  async sendDMByUserId(
    cookies: InstagramCookies,
    userId: string,
    message: string
  ): Promise<SendDMResponse> {
    try {
      const ig = await this.getClient(cookies);
      
      const thread = ig.entity.directThread([userId]);
      const result = await thread.broadcastText(message) as any;
      
      this.logger.log(`Sent DM to user ${userId}`);
      
      return {
        success: true,
        threadId: result.thread_id || result.payload?.thread_id,
        itemId: result.item_id || result.payload?.item_id,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(`Failed to send DM by userId: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // ==========================================================================
  // Inbox & Conversations
  // ==========================================================================

  /**
   * Fetches the user's DM inbox (list of conversations).
   */
  async getInbox(cookies: InstagramCookies, limit = 20): Promise<ConversationThread[]> {
    try {
      const ig = await this.getClient(cookies);
      
      const inboxFeed = ig.feed.directInbox();
      const threads = await inboxFeed.items();
      
      return threads.slice(0, limit).map((thread: any) => ({
        threadId: thread.thread_id,
        threadTitle: thread.thread_title || thread.users?.[0]?.username || 'Unknown',
        lastActivityAt: Number(thread.last_activity_at) || Date.now(),
        isGroup: thread.is_group || false,
        users: thread.users?.map((user: any) => ({
          pk: String(user.pk),
          username: user.username,
          fullName: user.full_name,
          profilePicUrl: user.profile_pic_url,
        })) || [],
        lastMessage: thread.last_permanent_item ? {
          text: thread.last_permanent_item.text,
          timestamp: Number(thread.last_permanent_item.timestamp) || Date.now(),
          userId: String(thread.last_permanent_item.user_id || ''),
        } : undefined,
        unreadCount: (thread as any).read_state === 0 ? 1 : 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch inbox: ${(error as Error).message}`);
      throw new BadRequestException('Failed to fetch inbox. Session may have expired.');
    }
  }

  /**
   * Fetches messages from a specific thread.
   */
  async getThreadMessages(
    cookies: InstagramCookies,
    threadId: string,
    limit = 50
  ): Promise<ThreadMessage[]> {
    try {
      const ig = await this.getClient(cookies);
      
      const threadFeed = ig.feed.directThread({ thread_id: threadId, oldest_cursor: '' } as any);
      const items = await threadFeed.items();
      
      return items.slice(0, limit).map((item: any) => ({
        itemId: item.item_id,
        userId: String(item.user_id || ''),
        timestamp: Number(item.timestamp) || Date.now(),
        itemType: item.item_type,
        text: item.text,
        mediaUrl: item.media?.image_versions2?.candidates?.[0]?.url,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch thread messages: ${(error as Error).message}`);
      throw new BadRequestException('Failed to fetch thread messages.');
    }
  }

  /**
   * Marks a thread as seen/read.
   */
  async markThreadAsSeen(cookies: InstagramCookies, threadId: string): Promise<void> {
    try {
      const ig = await this.getClient(cookies);
      // Use direct API call to mark as seen
      await ig.directThread.markItemSeen(threadId, '');
    } catch (error) {
      this.logger.warn(`Failed to mark thread as seen: ${(error as Error).message}`);
    }
  }

  // ==========================================================================
  // User Lookup
  // ==========================================================================

  /**
   * Gets user info by username.
   */
  async getUserByUsername(cookies: InstagramCookies, username: string): Promise<InstagramUserInfo | null> {
    try {
      const ig = await this.getClient(cookies);
      const user = await ig.user.searchExact(username);
      
      return {
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name,
        profilePicUrl: user.profile_pic_url,
        isPrivate: user.is_private,
      };
    } catch (error) {
      this.logger.warn(`User not found: ${username}`);
      return null;
    }
  }

  /**
   * Searches for users by query string.
   */
  async searchUsers(cookies: InstagramCookies, query: string, limit = 10): Promise<InstagramUserInfo[]> {
    try {
      const ig = await this.getClient(cookies);
      const users = await ig.user.search(query);
      
      return users.users.slice(0, limit).map((user) => ({
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name,
        profilePicUrl: user.profile_pic_url,
        isPrivate: user.is_private,
        followerCount: user.follower_count,
      }));
    } catch (error) {
      this.logger.error(`User search failed: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Gets detailed user profile including bio.
   */
  async getUserProfile(cookies: InstagramCookies, userId: string): Promise<any | null> {
    try {
      const ig = await this.getClient(cookies);
      const user = await ig.user.info(userId);
      
      // Check friendship status to see if we follow them
      let friendshipStatus: any = null;
      try {
        friendshipStatus = await ig.friendship.show(userId);
      } catch (e) {
        this.logger.warn(`Could not get friendship status: ${(e as Error).message}`);
      }
      
      return {
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name,
        bio: user.biography,
        profilePicUrl: user.profile_pic_url,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        postCount: user.media_count,
        isPrivate: user.is_private,
        isVerified: user.is_verified,
        isBusiness: user.is_business,
        externalUrl: user.external_url,
        category: user.category,
        // Friendship info
        followedByViewer: friendshipStatus?.following || false,
        followsViewer: friendshipStatus?.followed_by || false,
        blockedByViewer: friendshipStatus?.blocking || false,
      };
    } catch (error) {
      this.logger.error(`Failed to get user profile: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Gets detailed profile by username.
   */
  async getUserProfileByUsername(cookies: InstagramCookies, username: string): Promise<any | null> {
    try {
      const ig = await this.getClient(cookies);
      const userId = await ig.user.getIdByUsername(username);
      return this.getUserProfile(cookies, userId.toString());
    } catch (error) {
      this.logger.error(`Failed to get profile for @${username}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Gets followers of a user (for lead scraping).
   */
  async getUserFollowers(cookies: InstagramCookies, userId: string, limit = 50): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      const followersFeed = ig.feed.accountFollowers(userId);
      
      const followers: any[] = [];
      let page = await followersFeed.items();
      
      while (followers.length < limit && page.length > 0) {
        for (const follower of page) {
          if (followers.length >= limit) break;
          followers.push({
            pk: follower.pk.toString(),
            username: follower.username,
            fullName: follower.full_name,
            profilePicUrl: follower.profile_pic_url,
            isPrivate: follower.is_private,
            isVerified: follower.is_verified,
          });
        }
        
        if (!followersFeed.isMoreAvailable() || followers.length >= limit) break;
        page = await followersFeed.items();
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return followers;
    } catch (error) {
      this.logger.error(`Failed to get followers: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Gets following of a user (for lead scraping).
   */
  async getUserFollowing(cookies: InstagramCookies, userId: string, limit = 50): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      const followingFeed = ig.feed.accountFollowing(userId);
      
      const following: any[] = [];
      let page = await followingFeed.items();
      
      while (following.length < limit && page.length > 0) {
        for (const user of page) {
          if (following.length >= limit) break;
          following.push({
            pk: user.pk.toString(),
            username: user.username,
            fullName: user.full_name,
            profilePicUrl: user.profile_pic_url,
            isPrivate: user.is_private,
            isVerified: user.is_verified,
          });
        }
        
        if (!followingFeed.isMoreAvailable() || following.length >= limit) break;
        page = await followingFeed.items();
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return following;
    } catch (error) {
      this.logger.error(`Failed to get following: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Search hashtag and get recent posts' authors (for lead scraping).
   */
  async getHashtagUsers(cookies: InstagramCookies, hashtag: string, limit = 50): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      
      // Remove # if present
      const cleanHashtag = hashtag.replace(/^#/, '');
      this.logger.log(`[HASHTAG] Searching hashtag #${cleanHashtag} for users (limit: ${limit})...`);
      
      const users: any[] = [];
      const seenUsers = new Set<string>();
      let totalPostsProcessed = 0;
      let postsSkippedNoUser = 0;
      let postsSkippedNoUsername = 0;
      let postsError = 0;
      
      // Try TagFeed (this includes both posts and reels)
      let hashtagFeed: any = null;
      let page: any[] = [];
      
      try {
        this.logger.log(`[HASHTAG] Attempting TagFeed for #${cleanHashtag} (includes posts & reels)...`);
        hashtagFeed = ig.feed.tag(cleanHashtag);
        
        // Add a timeout to avoid hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TagFeed request timeout')), 30000)
        );
        
        page = await Promise.race([
          hashtagFeed.items(),
          timeoutPromise
        ]) as any[];
        
        this.logger.log(`[HASHTAG] TagFeed: Got ${page.length} items (posts/reels) from hashtag #${cleanHashtag}`);
      } catch (tagFeedError: any) {
        const errorMsg = tagFeedError?.message || 'Unknown error';
        const errorCode = tagFeedError?.response?.status || tagFeedError?.code || 'N/A';
        const errorBody = tagFeedError?.response?.body || tagFeedError?.body || 'N/A';
        
        this.logger.error(`[HASHTAG] TagFeed failed: ${errorMsg}`);
        this.logger.error(`[HASHTAG] Error code: ${errorCode}`);
        this.logger.error(`[HASHTAG] Error body: ${JSON.stringify(errorBody).substring(0, 200)}`);
        
        // Check for specific error types
        if (errorMsg.includes('rate limit') || errorCode === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes and try again.');
        } else if (errorMsg.includes('login') || errorCode === 401) {
          throw new Error('Instagram session expired. Please reconnect your account.');
        } else if (errorMsg.includes('not found') || errorCode === 404) {
          throw new Error(`Hashtag #${cleanHashtag} not found or has no content.`);
        } else {
          // Generic error - suggest bio search
          this.logger.warn(`[HASHTAG] Suggestion: Use 'User Bio' search mode instead`);
          throw new Error(`Failed to fetch hashtag content: ${errorMsg}. Try using 'User Bio' search instead, or check your Instagram session.`);
        }
      }
      
      if (page.length === 0) {
        this.logger.warn(`[HASHTAG] No posts/reels found for hashtag #${cleanHashtag}`);
        this.logger.log(`[HASHTAG] Suggestion: Try using 'User Bio' search instead, or the hashtag may not exist/have content`);
        return [];
      }
      
      let pageCount = 0;
      const maxPages = 10; // Limit pages to avoid infinite loops
      
      // Log first post structure for debugging
      if (page.length > 0) {
        const firstPost = page[0] as any;
        this.logger.log(`[DEBUG] First post structure keys: ${Object.keys(firstPost).slice(0, 30).join(', ')}`);
        this.logger.log(`[DEBUG] First post has user: ${!!firstPost.user}`);
        this.logger.log(`[DEBUG] First post has owner: ${!!firstPost.owner}`);
        this.logger.log(`[DEBUG] First post user_pk: ${firstPost.user_pk || 'none'}`);
        this.logger.log(`[DEBUG] First post user_id: ${firstPost.user_id || 'none'}`);
        
        // Check if user_pk exists directly on the post
        if (firstPost.user_pk) {
          this.logger.log(`[DEBUG] ✓ Found user_pk directly: ${firstPost.user_pk}`);
        }
        
        // Check user property structure
        if (firstPost.user) {
          const userKeys = Object.keys(firstPost.user).slice(0, 20);
          this.logger.log(`[DEBUG] User object keys: ${userKeys.join(', ')}`);
          this.logger.log(`[DEBUG] User pk: ${firstPost.user.pk || 'none'}`);
          this.logger.log(`[DEBUG] User id: ${firstPost.user.id || 'none'}`);
          this.logger.log(`[DEBUG] User username: ${firstPost.user.username || 'none'}`);
          
          // Try to access user properties directly
          try {
            const userPk = firstPost.user.pk || firstPost.user.id;
            if (userPk) {
              this.logger.log(`[DEBUG] ✓ Can access user.pk/id: ${userPk}`);
            }
          } catch (e) {
            this.logger.warn(`[DEBUG] Cannot access user.pk: ${(e as Error).message}`);
          }
        }
      }
      
      while (users.length < limit && page.length > 0 && pageCount < maxPages) {
        pageCount++;
        
        for (const post of page) {
          if (users.length >= limit) break;
          
          totalPostsProcessed++;
          
          try {
            const postAny = post as any;
            
            // In instagram-private-api, posts from tag feed typically have:
            // - user_pk: direct property with user ID (most reliable)
            // - user: UserResponse object with user details
            
            let userId: string | null = null;
            let username: string | null = null;
            let user: any = null;
            
            // Method 1: user_pk property (most reliable in instagram-private-api)
            if (postAny.user_pk) {
              userId = postAny.user_pk.toString();
              this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Found user_pk: ${userId}`);
            }
            
            // Method 1b: user_id property (alternative)
            if (!userId && postAny.user_id) {
              userId = postAny.user_id.toString();
              this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Found user_id: ${userId}`);
            }
            
            // Method 1c: owner_id property
            if (!userId && postAny.owner_id) {
              userId = postAny.owner_id.toString();
              this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Found owner_id: ${userId}`);
            }
            
            // Method 2: Direct user property
            if (postAny.user) {
              try {
                user = postAny.user;
                // Try to get pk from user object - handle both direct access and getter
                let userPk: any = null;
                try {
                  userPk = user.pk || user.id || user.user_id;
                } catch (e) {
                  // Try accessing as property
                  try {
                    userPk = (user as any).pk || (user as any).id;
                  } catch (e2) {
                    this.logger.warn(`[HASHTAG] Cannot access user.pk/id: ${(e2 as Error).message}`);
                  }
                }
                
                if (userPk) {
                  userId = userId || userPk.toString();
                }
                username = user.username || user.user_name || username;
                this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Found user object, pk: ${userId}, username: ${username || 'none'}`);
              } catch (userError) {
                this.logger.warn(`[HASHTAG] Error accessing user object: ${(userError as Error).message}`);
              }
            }
            
            // Method 3: owner property (fallback)
            if (!user && postAny.owner) {
              try {
                user = postAny.owner;
                const ownerPk = user.pk || user.id || user.user_id;
                if (ownerPk) {
                  userId = userId || ownerPk.toString();
                }
                username = username || user.username || user.user_name;
                this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Found owner, pk: ${userId}`);
              } catch (ownerError) {
                this.logger.warn(`[HASHTAG] Error accessing owner: ${(ownerError as Error).message}`);
              }
            }
            
            // Method 4: Try to get user from caption
            if (!userId && postAny.caption) {
              try {
                const caption = postAny.caption;
                if (caption.user_id) {
                  userId = caption.user_id.toString();
                  this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Found user_id in caption: ${userId}`);
                }
                if (caption.user && !user) {
                  user = caption.user;
                  const captionUserPk = user.pk || user.id || user.user_id;
                  if (captionUserPk) {
                    userId = userId || captionUserPk.toString();
                  }
                  username = username || user.username || user.user_name;
                }
              } catch (captionError) {
                // Ignore
              }
            }
            
            // If we have userId but no username, fetch user info
            if (userId && !username) {
              try {
                this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Fetching user info for ${userId}...`);
                const userInfo = await ig.user.info(userId);
                username = userInfo.username;
                user = user || userInfo; // Use fetched info if we don't have user object
                this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Fetched user info: @${username}`);
              } catch (fetchError) {
                this.logger.warn(`[HASHTAG] Could not fetch user ${userId}: ${(fetchError as Error).message}`);
                // Continue without username - we'll skip this user
              }
            }
            
            // If we have userId but no user object, fetch it for full details
            if (userId && !user) {
              try {
                this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Fetching full profile for ${userId}...`);
                user = await ig.user.info(userId);
                username = username || user.username;
                this.logger.log(`[HASHTAG] Post ${totalPostsProcessed}: Fetched full profile: @${username || 'none'}`);
              } catch (fetchError) {
                this.logger.warn(`[HASHTAG] Could not fetch user profile ${userId}: ${(fetchError as Error).message}`);
                // We'll continue with just userId and username if available
              }
            }
            
            // Final check - we need at least userId
            if (!userId) {
              postsSkippedNoUser++;
              if (postsSkippedNoUser <= 3 || (pageCount === 1 && totalPostsProcessed <= 5)) {
                // Log first few failures in detail
                this.logger.warn(`[HASHTAG] Post ${totalPostsProcessed} missing user ID. Post keys: ${Object.keys(postAny).slice(0, 20).join(', ')}`);
                this.logger.warn(`[HASHTAG] Post has user: ${!!postAny.user}, has user_pk: ${!!postAny.user_pk}, has owner: ${!!postAny.owner}`);
              }
              continue;
            }
            
            // We need username to proceed
            if (!username) {
              postsSkippedNoUsername++;
              this.logger.warn(`[HASHTAG] User ${userId} missing username, skipping`);
              continue;
            }
            
            if (seenUsers.has(userId)) {
              continue;
            }
            seenUsers.add(userId);
            
            // Get user info - prefer fetched profile, fallback to post data
            let fullName = '';
            let profilePicUrl = '';
            let isPrivate = false;
            let isVerified = false;
            
            if (user) {
              fullName = user.full_name || user.fullName || '';
              profilePicUrl = user.profile_pic_url || user.profilePicUrl || user.profile_picture_url || '';
              isPrivate = user.is_private !== undefined ? user.is_private : (user.isPrivate !== undefined ? user.isPrivate : false);
              isVerified = user.is_verified !== undefined ? user.is_verified : (user.isVerified !== undefined ? user.isVerified : false);
              username = username || user.username || user.user_name || '';
            }
            
            // If we don't have username yet, try to fetch full profile
            if (!username || !fullName) {
              try {
                const userInfo = await ig.user.info(userId);
                username = username || userInfo.username;
                fullName = fullName || userInfo.full_name || '';
                profilePicUrl = profilePicUrl || userInfo.profile_pic_url || '';
                isPrivate = userInfo.is_private !== undefined ? userInfo.is_private : isPrivate;
                isVerified = userInfo.is_verified !== undefined ? userInfo.is_verified : isVerified;
              } catch (profileError) {
                this.logger.debug(`Could not fetch full profile for ${userId}: ${(profileError as Error).message}`);
              }
            }
            
            if (!username) {
              this.logger.warn(`User ${userId} missing username, skipping`);
              continue;
            }
            
            users.push({
              pk: userId,
              username: username,
              fullName: fullName,
              profilePicUrl: profilePicUrl,
              isPrivate: isPrivate,
              isVerified: isVerified,
              source: 'hashtag_post',
            });
            
            this.logger.log(`[HASHTAG] ✓ Added user @${username} (${userId}) from hashtag #${cleanHashtag} [${users.length}/${limit}]`);
          } catch (postError) {
            postsError++;
            this.logger.error(`[HASHTAG] Error processing post ${totalPostsProcessed}: ${(postError as Error).message}`);
            this.logger.error(`[HASHTAG] Post error stack: ${(postError as Error).stack}`);
            continue;
          }
        }
        
        if (users.length >= limit) {
          this.logger.log(`[HASHTAG] Reached limit of ${limit} users from hashtag #${cleanHashtag}`);
          break;
        }
        
        // Check if more pages are available
        if (!hashtagFeed.isMoreAvailable()) {
          this.logger.log(`[HASHTAG] No more posts available for hashtag #${cleanHashtag}`);
          break;
        }
        
        // Get next page
        try {
          page = await hashtagFeed.items();
          this.logger.log(`[HASHTAG] Fetched next page: ${page.length} posts`);
        } catch (pageError) {
          this.logger.error(`[HASHTAG] Error fetching next page: ${(pageError as Error).message}`);
          break;
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.logger.log(`[HASHTAG] Summary for #${cleanHashtag}: Found ${users.length} users from ${totalPostsProcessed} posts processed`);
      this.logger.log(`[HASHTAG] Skipped: ${postsSkippedNoUser} (no user ID), ${postsSkippedNoUsername} (no username), ${postsError} (errors)`);
      
      if (users.length === 0 && totalPostsProcessed > 0) {
        this.logger.error(`[HASHTAG] WARNING: Processed ${totalPostsProcessed} posts but found 0 users!`);
        this.logger.error(`[HASHTAG] This suggests posts are being fetched but user extraction is failing.`);
      }
      
      return users;
    } catch (error) {
      this.logger.error(`[HASHTAG] Failed to get hashtag users for #${hashtag}: ${(error as Error).message}`);
      this.logger.error(`[HASHTAG] Error stack: ${(error as Error).stack}`);
      return [];
    }
  }

  /**
   * Search users by keyword and filter by bio content.
   */
  async searchUsersByBio(cookies: InstagramCookies, keyword: string, limit = 50): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      
      // Search for users by the keyword
      const searchResults = await ig.user.search(keyword);
      const users: any[] = [];
      
      // Fetch profiles to check bio
      for (const user of searchResults.users) {
        if (users.length >= limit) break;
        
        try {
          // Get full profile to access bio
          const profile = await ig.user.info(user.pk);
          const bio = (profile.biography || '').toLowerCase();
          const keywordLower = keyword.toLowerCase();
          
          // Check if bio contains the keyword
          if (bio.includes(keywordLower)) {
            users.push({
              pk: profile.pk.toString(),
              username: profile.username,
              fullName: profile.full_name,
              bio: profile.biography,
              profilePicUrl: profile.profile_pic_url,
              isPrivate: profile.is_private,
              isVerified: profile.is_verified,
              followerCount: profile.follower_count,
              followingCount: profile.following_count,
              matchedInBio: true,
            });
          }
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          this.logger.warn(`Could not fetch profile for ${user.username}: ${(e as Error).message}`);
        }
      }
      
      return users;
    } catch (error) {
      this.logger.error(`Failed to search users by bio: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Get hashtag users with bio info for better filtering.
   */
  async getHashtagUsersWithProfiles(
    cookies: InstagramCookies, 
    hashtag: string, 
    limit = 50,
    bioKeywords?: string[]
  ): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      
      // Remove # if present
      const cleanHashtag = hashtag.replace(/^#/, '');
      this.logger.log(`Searching hashtag #${cleanHashtag} with profile filtering...`);
      
      const hashtagFeed = ig.feed.tag(cleanHashtag);
      
      const users: any[] = [];
      const seenUsers = new Set<string>();
      let processedCount = 0;
      const maxProcess = limit * 3; // Process up to 3x the limit to find matches
      let pageCount = 0;
      const maxPages = 10;
      
      let page = await hashtagFeed.items();
      this.logger.log(`Got ${page.length} posts from hashtag #${cleanHashtag}`);
      
      if (page.length === 0) {
        this.logger.warn(`No posts found for hashtag #${cleanHashtag}`);
        return [];
      }
      
      while (users.length < limit && page.length > 0 && processedCount < maxProcess && pageCount < maxPages) {
        pageCount++;
        
        for (const post of page) {
          if (users.length >= limit || processedCount >= maxProcess) break;
          
          try {
            const postAny = post as any;
            
            // Extract user from post - try multiple methods
            let userId: string | null = null;
            let username: string | null = null;
            let user: any = null;
            
            // Method 1: Direct user property
            if (postAny.user) {
              user = postAny.user;
              userId = (user.pk || user.id || user.user_id || postAny.user_pk)?.toString();
              username = user.username || user.user_name;
            }
            
            // Method 2: user_pk property
            if (!userId && postAny.user_pk) {
              userId = postAny.user_pk.toString();
            }
            
            // Method 3: owner property
            if (!user && postAny.owner) {
              user = postAny.owner;
              userId = (user.pk || user.id || user.user_id)?.toString();
              username = user.username || user.user_name;
            }
            
            // Method 4: caption.user
            if (!user && postAny.caption?.user) {
              user = postAny.caption.user;
              userId = (user.pk || user.id || user.user_id)?.toString();
              username = user.username || user.user_name;
            }
            
            // If we have userId but no user object, fetch it
            if (userId && !user) {
              try {
                user = await ig.user.info(userId);
                username = user.username || username;
              } catch (fetchError) {
                this.logger.warn(`Could not fetch user ${userId}: ${(fetchError as Error).message}`);
              }
            }
            
            // Final check - we need at least userId
            if (!userId) {
              this.logger.warn(`Post missing user ID. Post keys: ${Object.keys(postAny).join(', ')}`);
              continue;
            }
            
            if (seenUsers.has(userId)) {
              continue;
            }
            seenUsers.add(userId);
            processedCount++;
            
            try {
              // Fetch full profile for bio
              const profile = await ig.user.info(userId);
              const bio = (profile.biography || '').toLowerCase();
              
              // Check if bio matches any keywords (if provided)
              let matchedKeyword: string | null = null;
              if (bioKeywords && bioKeywords.length > 0) {
                for (const keyword of bioKeywords) {
                  if (bio.includes(keyword.toLowerCase())) {
                    matchedKeyword = keyword;
                    break;
                  }
                }
                // Skip if no keyword match (only when keywords are provided)
                if (!matchedKeyword) {
                  this.logger.debug(`User @${profile.username} bio doesn't match keywords, skipping`);
                  continue;
                }
              }
              
              users.push({
                pk: userId,
                username: profile.username,
                fullName: profile.full_name,
                bio: profile.biography,
                profilePicUrl: profile.profile_pic_url,
                isPrivate: profile.is_private,
                isVerified: profile.is_verified,
                followerCount: profile.follower_count,
                followingCount: profile.following_count,
                matchedKeyword,
                source: 'hashtag',
              });
              
              this.logger.log(`✓ Added user @${profile.username} from hashtag #${cleanHashtag}${matchedKeyword ? ` (matched: ${matchedKeyword})` : ''}`);
              
              // Small delay to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (profileError) {
              // If we can't get the profile, add basic info from post (only if no bio keywords required)
              if (!bioKeywords || bioKeywords.length === 0) {
                const finalUsername = username || user?.username || user?.user_name || '';
                if (!finalUsername) {
                  this.logger.warn(`User ${userId} missing username, skipping`);
                  continue;
                }
                
                users.push({
                  pk: userId,
                  username: finalUsername,
                  fullName: user?.full_name || user?.fullName || '',
                  profilePicUrl: user?.profile_pic_url || user?.profilePicUrl || '',
                  isPrivate: user?.is_private !== undefined ? user.is_private : (user?.isPrivate !== undefined ? user.isPrivate : false),
                  isVerified: user?.is_verified !== undefined ? user.is_verified : (user?.isVerified !== undefined ? user.isVerified : false),
                  source: 'hashtag',
                });
                this.logger.log(`✓ Added user @${finalUsername} from post (no profile fetch)`);
              } else {
                this.logger.warn(`Could not fetch profile for user ${userId}, skipping (bio keywords required)`);
              }
            }
          } catch (postError) {
            this.logger.warn(`Error processing post: ${(postError as Error).message}`);
            this.logger.debug(`Post error details: ${(postError as Error).stack}`);
            continue;
          }
        }
        
        if (users.length >= limit) {
          this.logger.log(`Reached limit of ${limit} users from hashtag #${cleanHashtag}`);
          break;
        }
        
        // Check if more pages are available
        if (!hashtagFeed.isMoreAvailable()) {
          this.logger.log(`No more posts available for hashtag #${cleanHashtag}`);
          break;
        }
        
        // Get next page
        try {
          page = await hashtagFeed.items();
          this.logger.log(`Fetched next page: ${page.length} posts`);
        } catch (pageError) {
          this.logger.warn(`Error fetching next page: ${(pageError as Error).message}`);
          break;
        }
        
        // Small delay between pages
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.logger.log(`Found ${users.length} users from hashtag #${cleanHashtag}${bioKeywords && bioKeywords.length > 0 ? ` (with bio filtering)` : ''}`);
      return users;
    } catch (error) {
      this.logger.error(`Failed to get hashtag users with profiles for #${hashtag}: ${(error as Error).message}`);
      this.logger.error(`Error stack: ${(error as Error).stack}`);
      return [];
    }
  }

  /**
   * Combined search: hashtag posts + bio filtering.
   */
  async searchByKeyword(
    cookies: InstagramCookies,
    keyword: string,
    searchSource: 'posts' | 'bio' | 'both',
    limit = 50,
    bioKeywords?: string[]
  ): Promise<{ users: any[]; source: string }> {
    const allUsers: any[] = [];
    const seenUserIds = new Set<string>();

    try {
      if (searchSource === 'posts' || searchSource === 'both') {
        // Search hashtag posts
        this.logger.log(`Searching hashtag #${keyword} posts...`);
        const hashtagUsers = bioKeywords && bioKeywords.length > 0
          ? await this.getHashtagUsersWithProfiles(cookies, keyword, Math.ceil(limit / (searchSource === 'both' ? 2 : 1)), bioKeywords)
          : await this.getHashtagUsers(cookies, keyword, Math.ceil(limit / (searchSource === 'both' ? 2 : 1)));
        
        for (const user of hashtagUsers) {
          if (!seenUserIds.has(user.pk)) {
            seenUserIds.add(user.pk);
            allUsers.push({ ...user, source: 'hashtag_post' });
          }
        }
      }

      if (searchSource === 'bio' || searchSource === 'both') {
        // Search users by bio
        this.logger.log(`Searching users with "${keyword}" in bio...`);
        const bioUsers = await this.searchUsersByBio(
          cookies, 
          keyword, 
          Math.ceil(limit / (searchSource === 'both' ? 2 : 1))
        );
        
        for (const user of bioUsers) {
          if (!seenUserIds.has(user.pk)) {
            seenUserIds.add(user.pk);
            allUsers.push({ ...user, source: 'bio_match' });
          }
        }
      }

      return {
        users: allUsers.slice(0, limit),
        source: searchSource,
      };
    } catch (error) {
      this.logger.error(`Keyword search failed: ${(error as Error).message}`);
      return { users: [], source: searchSource };
    }
  }

  /**
   * Bulk fetch user profiles with bio info.
   */
  async getBulkUserProfiles(cookies: InstagramCookies, userIds: string[]): Promise<any[]> {
    const profiles: any[] = [];
    
    for (const userId of userIds) {
      try {
        const profile = await this.getUserProfile(cookies, userId);
        if (profile) {
          profiles.push(profile);
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        this.logger.warn(`Failed to fetch profile for user ${userId}`);
      }
    }
    
    return profiles;
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  /**
   * Encrypts cookies for storage.
   * TODO: Implement with AES-256-GCM in production.
   */
  private encryptCookies(cookies: InstagramCookies): string {
    // For now, just base64 encode (NOT SAFE FOR PRODUCTION)
    this.logger.warn('Cookie encryption not implemented - using base64 encoding');
    return Buffer.from(JSON.stringify(cookies)).toString('base64');
  }

  /**
   * Decrypts stored cookies.
   */
  decryptCookies(encrypted: string): InstagramCookies {
    try {
      return JSON.parse(Buffer.from(encrypted, 'base64').toString('utf-8'));
    } catch {
      throw new BadRequestException('Failed to decrypt stored cookies');
    }
  }

  /**
   * Clears cached client for a user.
   */
  clearClientCache(dsUserId: string): void {
    this.clientCache.delete(dsUserId);
  }
}

