import { IgApiClient } from 'instagram-private-api';
import { prisma } from '../prisma/client';
import type { InstagramCookies, InstagramUserInfo } from './types';
import crypto from 'crypto';

// Simple client cache
const clientCache = new Map<string, { client: IgApiClient; expiresAt: number }>();

// Encryption key from environment
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  return key.substring(0, 32);
}

export class InstagramCookieService {
  /**
   * Gets or creates an authenticated client from cache or cookies.
   */
  async getClient(cookies: InstagramCookies): Promise<IgApiClient> {
    const cached = clientCache.get(cookies.dsUserId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.client;
    }
    return this.createClientFromCookies(cookies);
  }

  /**
   * Creates an authenticated Instagram client using browser cookies.
   */
  async createClientFromCookies(cookies: InstagramCookies): Promise<IgApiClient> {
    const ig = new IgApiClient();
    ig.state.generateDevice(cookies.dsUserId);
    
    try {
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

      await ig.state.deserializeCookieJar(JSON.stringify(cookieJar));
      await ig.account.currentUser();
      
      clientCache.set(cookies.dsUserId, {
        client: ig,
        expiresAt: Date.now() + 30 * 60 * 1000,
      });

      return ig;
    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error';
      if (errorMsg.includes('checkpoint')) {
        throw new Error('Instagram requires verification. Please complete security checks.');
      }
      if (errorMsg.includes('login_required')) {
        throw new Error('Session expired. Please re-login to Instagram.');
      }
      throw new Error('Failed to verify Instagram session.');
    }
  }

  private buildCookie(key: string, value: string, httpOnly: boolean) {
    const now = new Date().toISOString();
    return {
      key,
      value,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
   * Verifies cookies and returns current user info.
   */
  async verifySession(cookies: InstagramCookies): Promise<InstagramUserInfo> {
    const ig = await this.createClientFromCookies(cookies);
    const currentUser = await ig.account.currentUser();
    
    return {
      pk: currentUser.pk.toString(),
      username: currentUser.username,
      fullName: currentUser.full_name || currentUser.username,
      profilePicUrl: currentUser.profile_pic_url,
      isPrivate: currentUser.is_private || false,
      followerCount: (currentUser as any).follower_count,
      followingCount: (currentUser as any).following_count,
      postCount: (currentUser as any).media_count,
      isVerified: (currentUser as any).is_verified || false,
      bio: (currentUser as any).biography || '',
    };
  }

  /**
   * Encrypt cookies for secure storage
   */
  private encryptCookies(cookies: InstagramCookies): string {
    try {
      const key = getEncryptionKey();
      const algorithm = 'aes-256-cbc';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'utf8'), iv);
      
      let encrypted = cipher.update(JSON.stringify(cookies), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      // Fallback to base64 if encryption fails (for development)
      console.warn('Encryption failed, using base64:', error);
      return Buffer.from(JSON.stringify(cookies)).toString('base64');
    }
  }

  /**
   * Save Instagram account with cookies to database
   */
  async saveAccountWithCookies(
    workspaceId: string,
    cookies: InstagramCookies,
    userInfo: InstagramUserInfo
  ): Promise<{ id: string; igUsername: string }> {
    const encryptedCookies = this.encryptCookies(cookies);

    const account = await prisma.instagramAccount.upsert({
      where: {
        igUserId_workspaceId: {
          igUserId: userInfo.pk,
          workspaceId,
        },
      },
      update: {
        igUsername: userInfo.username,
        accessToken: encryptedCookies,
        profilePictureUrl: userInfo.profilePicUrl || null,
        isActive: true,
        permissions: ['cookie_auth', 'dm_send', 'dm_read'],
        accessTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cookies: cookies as any, // Save cookies as JSONB
      },
      create: {
        workspaceId,
        igUserId: userInfo.pk,
        igUsername: userInfo.username,
        fbPageId: `cookie_auth_${userInfo.pk}`,
        accessToken: encryptedCookies,
        profilePictureUrl: userInfo.profilePicUrl || null,
        permissions: ['cookie_auth', 'dm_send', 'dm_read'],
        accessTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cookies: cookies as any, // Save cookies as JSONB
      },
    });

    return {
      id: account.id,
      igUsername: account.igUsername,
    };
  }

  /**
   * Send DM to a user by username
   */
  async sendDM(cookies: InstagramCookies, request: { recipientUsername: string; message: string }): Promise<{ success: boolean; error?: string; threadId?: string; itemId?: string }> {
    try {
      const ig = await this.getClient(cookies);
      const userId = await ig.user.getIdByUsername(request.recipientUsername);
      const thread = ig.entity.directThread([userId.toString()]);
      const result = await thread.broadcastText(request.message) as any;
      
      return {
        success: true,
        threadId: result.thread_id || result.payload?.thread_id,
        itemId: result.item_id || result.payload?.item_id,
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('User not found')) {
        return { success: false, error: `User @${request.recipientUsername} not found` };
      }
      if (errorMessage.includes('feedback_required')) {
        return { success: false, error: 'Instagram has temporarily blocked messaging. Please try again later.' };
      }
      if (errorMessage.includes('login_required')) {
        return { success: false, error: 'Session expired. Please re-authenticate with fresh cookies.' };
      }
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send DM to a user by user ID
   */
  async sendDMByUserId(cookies: InstagramCookies, userId: string, message: string): Promise<{ success: boolean; error?: string; threadId?: string; itemId?: string }> {
    try {
      // Validate user ID
      if (!userId || userId.trim() === '') {
        return { success: false, error: 'Invalid user ID provided' };
      }

      // Convert user ID to string (Instagram API expects string format)
      const userIdStr = String(userId).trim();
      
      // Validate it's a numeric string (Instagram user IDs are numeric)
      if (!/^\d+$/.test(userIdStr)) {
        return { success: false, error: `Invalid user ID format: ${userIdStr}. User ID must be numeric.` };
      }

      const ig = await this.getClient(cookies);
      
      // Try to get user info to validate the user exists (optional check)
      let userInfo = null;
      try {
        userInfo = await ig.user.info(userIdStr);
        console.log('User info retrieved:', { userId: userIdStr, username: userInfo?.username });
      } catch (userError: any) {
        const errorMsg = userError?.message || 'Unknown error';
        console.warn('Could not fetch user info:', errorMsg);
        // Continue anyway - user might exist but info might be private
      }

      // Create thread and send message
      // Note: Instagram requires the user ID to be in the thread array
      const thread = ig.entity.directThread([userIdStr]);
      
      // Log the attempt
      console.log('Attempting to send DM:', { 
        userId: userIdStr, 
        messageLength: message.length,
        hasUserInfo: !!userInfo 
      });
      
      const result = await thread.broadcastText(message) as any;
      
      return {
        success: true,
        threadId: result.thread_id || result.payload?.thread_id,
        itemId: result.item_id || result.payload?.item_id,
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const errorResponse = error?.response || {};
      const errorBody = errorResponse?.body || {};
      
      // Log full error details for debugging
      console.error('Instagram DM send error:', {
        message: errorMessage,
        status: errorResponse?.status,
        body: errorBody,
        userId: userId,
      });
      
      // Handle specific Instagram error cases
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request') || errorResponse?.status === 400) {
        if (errorMessage.includes('feedback_required') || errorResponse?.feedback_required) {
          return { success: false, error: 'Instagram has temporarily blocked messaging. Please try again later or verify your account.' };
        }
        if (errorMessage.includes('login_required') || errorResponse?.login_required) {
          return { success: false, error: 'Session expired. Please re-authenticate with fresh cookies.' };
        }
        if (errorMessage.includes('checkpoint') || errorResponse?.checkpoint_required) {
          return { success: false, error: 'Instagram requires verification. Please complete security checks.' };
        }
        if (errorMessage.includes('spam') || errorResponse?.spam) {
          return { success: false, error: 'Message blocked by Instagram spam filters. Please try again later.' };
        }
        return { 
          success: false, 
          error: `Instagram API error: ${errorMessage}. This might be due to invalid user ID, rate limiting, or account restrictions.` 
        };
      }
      
      if (errorMessage.includes('User not found') || errorMessage.includes('not found')) {
        return { success: false, error: `User with ID ${userId} not found` };
      }
      
      if (errorMessage.includes('feedback_required')) {
        return { success: false, error: 'Instagram has temporarily blocked messaging. Please try again later.' };
      }
      
      if (errorMessage.includes('login_required')) {
        return { success: false, error: 'Session expired. Please re-authenticate with fresh cookies.' };
      }

      return { 
        success: false, 
        error: errorMessage || 'Failed to send DM. Please check your cookies and try again.' 
      };
    }
  }

  /**
   * Get thread messages
   */
  async getThreadMessages(cookies: InstagramCookies, threadId: string, limit = 50): Promise<any[]> {
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
      console.error('Failed to fetch thread messages:', error);
      return [];
    }
  }

  /**
   * Mark thread as seen
   */
  async markThreadAsSeen(cookies: InstagramCookies, threadId: string): Promise<void> {
    try {
      const ig = await this.getClient(cookies);
      await ig.directThread.markItemSeen(threadId, '');
    } catch (error) {
      console.warn('Failed to mark thread as seen:', error);
    }
  }

  /**
   * Search by keyword (hashtag posts or bio)
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
        const hashtagUsers = await this.getHashtagUsers(cookies, keyword, Math.ceil(limit / (searchSource === 'both' ? 2 : 1)));
        for (const user of hashtagUsers) {
          if (!seenUserIds.has(user.pk)) {
            seenUserIds.add(user.pk);
            allUsers.push({ ...user, source: 'hashtag_post' });
          }
        }
      }

      if (searchSource === 'bio' || searchSource === 'both') {
        const bioUsers = await this.searchUsersByBio(cookies, keyword, Math.ceil(limit / (searchSource === 'both' ? 2 : 1)));
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
      console.error('Keyword search failed:', error);
      return { users: [], source: searchSource };
    }
  }

  /**
   * Search users by bio
   */
  async searchUsersByBio(cookies: InstagramCookies, keyword: string, limit = 50): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      const searchResults = await ig.user.search(keyword);
      const users: any[] = [];
      
      for (const user of searchResults.users) {
        if (users.length >= limit) break;
        
        try {
          const profile = await ig.user.info(user.pk);
          const bio = (profile.biography || '').toLowerCase();
          const keywordLower = keyword.toLowerCase();
          
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
          
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          console.warn(`Could not fetch profile for ${user.username}:`, e);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Failed to search users by bio:', error);
      return [];
    }
  }

  /**
   * Get bulk user profiles
   */
  async getBulkUserProfiles(cookies: InstagramCookies, userIds: string[]): Promise<any[]> {
    const profiles: any[] = [];
    
    for (const userId of userIds) {
      try {
        const profile = await this.getUserProfile(cookies, userId);
        if (profile) {
          profiles.push(profile);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(`Failed to fetch profile for user ${userId}`);
      }
    }
    
    return profiles;
  }

  /**
   * Search users by query
   */
  async searchUsers(cookies: InstagramCookies, query: string, limit = 10): Promise<InstagramUserInfo[]> {
    try {
      const ig = await this.getClient(cookies);
      const users = await ig.user.search(query);
      
      return users.users.slice(0, limit).map((user: any) => ({
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name || user.username,
        profilePicUrl: user.profile_pic_url,
        isPrivate: user.is_private || false,
        followerCount: user.follower_count || 0,
      }));
    } catch (error) {
      console.error('User search failed:', error);
      return [];
    }
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(cookies: InstagramCookies, userId: string): Promise<any | null> {
    try {
      const ig = await this.getClient(cookies);
      const user = await ig.user.info(userId);
      
      let friendshipStatus: any = null;
      try {
        friendshipStatus = await ig.friendship.show(userId);
      } catch (e) {
        // Ignore friendship errors
      }
      
      return {
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name || user.username,
        bio: user.biography || '',
        profilePicUrl: user.profile_pic_url,
        followerCount: (user as any).follower_count || 0,
        followingCount: (user as any).following_count || 0,
        postCount: (user as any).media_count || 0,
        isPrivate: user.is_private || false,
        isVerified: (user as any).is_verified || false,
        isBusiness: (user as any).is_business || false,
        externalUrl: (user as any).external_url || null,
        category: (user as any).category || null,
        followedByViewer: friendshipStatus?.following || false,
        followsViewer: friendshipStatus?.followed_by || false,
        blockedByViewer: friendshipStatus?.blocking || false,
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Get user profile by username
   */
  async getUserProfileByUsername(cookies: InstagramCookies, username: string): Promise<any | null> {
    try {
      const ig = await this.getClient(cookies);
      const userId = await ig.user.getIdByUsername(username);
      return this.getUserProfile(cookies, userId.toString());
    } catch (error) {
      console.error(`Failed to get profile for @${username}:`, error);
      return null;
    }
  }

  /**
   * Get user by username (basic info)
   */
  async getUserByUsername(cookies: InstagramCookies, username: string): Promise<any | null> {
    try {
      const ig = await this.getClient(cookies);
      const user = await ig.user.searchExact(username);
      if (!user) return null;
      
      return {
        pk: user.pk.toString(),
        username: user.username,
        fullName: user.full_name || user.username,
        profilePicUrl: user.profile_pic_url,
        isPrivate: user.is_private || false,
      };
    } catch (error) {
      console.error(`Failed to get user @${username}:`, error);
      return null;
    }
  }

  /**
   * Get followers of a user
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
            pk: (follower as any).pk.toString(),
            username: (follower as any).username,
            fullName: (follower as any).full_name,
            profilePicUrl: (follower as any).profile_pic_url,
            isPrivate: (follower as any).is_private || false,
            isVerified: (follower as any).is_verified || false,
          });
        }
        
        if (!followersFeed.isMoreAvailable() || followers.length >= limit) break;
        page = await followersFeed.items();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return followers;
    } catch (error) {
      console.error('Failed to get followers:', error);
      return [];
    }
  }

  /**
   * Get following of a user
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
            pk: (user as any).pk.toString(),
            username: (user as any).username,
            fullName: (user as any).full_name,
            profilePicUrl: (user as any).profile_pic_url,
            isPrivate: (user as any).is_private || false,
            isVerified: (user as any).is_verified || false,
          });
        }
        
        if (!followingFeed.isMoreAvailable() || following.length >= limit) break;
        page = await followingFeed.items();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return following;
    } catch (error) {
      console.error('Failed to get following:', error);
      return [];
    }
  }

  /**
   * Get users from hashtag
   */
  async getHashtagUsers(cookies: InstagramCookies, hashtag: string, limit = 50): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      const cleanHashtag = hashtag.replace(/^#/, '');
      const hashtagFeed = ig.feed.tag(cleanHashtag);
      const users: any[] = [];
      const seenUsers = new Set<string>();
      let page = await hashtagFeed.items();
      
      while (users.length < limit && page.length > 0) {
        for (const item of page) {
          if (users.length >= limit) break;
          const user = (item as any).user || (item as any).owner;
          if (user && user.pk && !seenUsers.has(user.pk.toString())) {
            seenUsers.add(user.pk.toString());
            users.push({
              pk: user.pk.toString(),
              username: user.username,
              fullName: user.full_name || user.username,
              profilePicUrl: user.profile_pic_url,
              isPrivate: user.is_private || false,
            });
          }
        }
        
        if (!hashtagFeed.isMoreAvailable() || users.length >= limit) break;
        page = await hashtagFeed.items();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return users;
    } catch (error) {
      console.error('Failed to get hashtag users:', error);
      return [];
    }
  }

  /**
   * Get inbox (conversations)
   */
  async getInbox(cookies: InstagramCookies, limit = 20): Promise<any[]> {
    try {
      const ig = await this.getClient(cookies);
      const inboxFeed = ig.feed.directInbox();
      const threads = await inboxFeed.items();
      
      return threads.slice(0, limit).map((thread: any) => ({
        threadId: thread.thread_id,
        users: thread.users.map((u: any) => ({
          pk: u.pk.toString(),
          username: u.username,
          fullName: u.full_name,
          profilePicUrl: u.profile_pic_url,
        })),
        lastActivity: thread.last_activity_at,
        unreadCount: thread.unread_count || 0,
      }));
    } catch (error) {
      console.error('Failed to get inbox:', error);
      return [];
    }
  }
}

export const instagramCookieService = new InstagramCookieService();

