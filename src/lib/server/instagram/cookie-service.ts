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
   * Decrypt cookies from encrypted storage
   */
  decryptCookies(encrypted: string): InstagramCookies {
    try {
      // Check if it's encrypted format (iv:encrypted) or base64
      if (encrypted.includes(':')) {
        const [ivHex, encryptedHex] = encrypted.split(':');
        const key = getEncryptionKey();
        const algorithm = 'aes-256-cbc';
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'utf8'), iv);
        
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
      } else {
        // Fallback: base64 decode
        return JSON.parse(Buffer.from(encrypted, 'base64').toString('utf8'));
      }
    } catch (error: any) {
      throw new Error(`Failed to decrypt cookies: ${error.message}`);
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
      try {
        await ig.user.info(userIdStr);
      } catch (userError: any) {
        // Continue anyway - user might exist but info might be private
      }

      // Create thread and send message
      // Note: Instagram requires the user ID to be in the thread array
      const thread = ig.entity.directThread([userIdStr]);
      
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

  /**
   * Get media by shortcode using web scraping (fallback method)
   * Uses Instagram API client to fetch the page with proper cookie handling
   */
  private async getMediaByShortcodeWeb(shortcode: string, cookies?: InstagramCookies): Promise<any | null> {
    try {
      const url = `https://www.instagram.com/reel/${shortcode}/`;
      console.log('[Media Info] Attempting web scrape method for:', url);
      
      if (!cookies) {
        console.error('[Media Info] No cookies provided for web scraping');
        return null;
      }
      
      // Use the Instagram API client to fetch the page (handles cookies properly)
      try {
        const ig = await this.getClient(cookies);
        
        // Try to get media using the client's request method
        // The instagram-private-api client has proper cookie handling
        console.log('[Media Info] Using Instagram API client to fetch page...');
        
        // Use the client's request method to fetch the HTML page
        const request = ig.request;
        const response = await request.send({
          url: url,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.instagram.com/',
          },
        });
        
        const html = typeof response === 'string' ? response : JSON.stringify(response);
        console.log('[Media Info] Got HTML via API client, length:', html.length);
        
        return this.extractMediaFromHTML(html, shortcode);
      } catch (clientError: any) {
        console.log('[Media Info] API client method failed, trying raw fetch:', clientError.message?.substring(0, 100));
      }
      
      // Fallback: Use raw fetch with cookies
      const cookieHeader = [
        `sessionid=${cookies.sessionId}`,
        `ds_user_id=${cookies.dsUserId}`,
        `csrftoken=${cookies.csrfToken}`,
        cookies.igDid ? `ig_did=${cookies.igDid}` : '',
        cookies.mid ? `mid=${cookies.mid}` : '',
        cookies.rur ? `rur=${cookies.rur}` : '',
      ].filter(Boolean).join('; ');
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.instagram.com/',
          'Cookie': cookieHeader,
          'X-Requested-With': 'XMLHttpRequest',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        console.error('[Media Info] Web scrape failed with status:', response.status);
        return null;
      }

      const html = await response.text();
      console.log('[Media Info] Web scrape HTML length:', html.length);
      
      return this.extractMediaFromHTML(html, shortcode);
    } catch (error: any) {
      console.error('[Media Info] Web scrape error:', error.message);
      return null;
    }
  }

  /**
   * Extract media info from HTML content
   */
  private extractMediaFromHTML(html: string, shortcode: string): any | null {
    // Check if we got the actual content page (large HTML = full page, small = login redirect)
    // Instagram pages are usually 500KB+ when fully loaded
    if (html.length < 50000) {
      console.error('[Media Info] ⚠️ HTML too short, likely a redirect page');
      return null;
    }
    
    // Check for actual login page (not just the word "login" which appears in all pages)
    // A real login page would be small and have a login form
    const hasLoginForm = html.includes('<input') && html.includes('name="username"') && html.length < 100000;
    if (hasLoginForm) {
      console.error('[Media Info] ⚠️ Got actual login page. Cookies may be invalid or expired.');
      return null;
    }
    
    // Log what we found in the HTML
    const htmlAnalysis = {
      length: html.length,
      hasCdnInstagram: html.includes('cdninstagram'),
      hasVideo: html.includes('video'),
      hasReel: html.includes('reel'),
      hasGraphql: html.includes('graphql'),
      hasSharedData: html.includes('_sharedData'),
      hasApplicationJson: html.includes('application/json'),
      hasMp4: html.includes('.mp4'),
    };
    console.log('[Media Info] HTML analysis:', htmlAnalysis);
    
    // If HTML is large but doesn't have expected content, still try extraction
    // (Instagram might have changed their structure)
    
    // Method 1: Try to find JSON data in script tags (multiple formats)
    console.log('[Media Info] Searching for JSON data in HTML...');
      
      // Method 1a: window._sharedData (old format)
      const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({[\s\S]+?});/);
      if (sharedDataMatch) {
        try {
          const data = JSON.parse(sharedDataMatch[1]);
          const media = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
          if (media) {
            console.log('[Media Info] ✅ Found media via _sharedData');
            return media;
          }
        } catch (e: any) {
          console.log('[Media Info] Failed to parse _sharedData:', e.message?.substring(0, 100));
        }
      }

      // Method 1b: window.__additionalDataLoaded or similar
      const additionalDataMatch = html.match(/window\.__additionalDataLoaded[^<]+({[\s\S]+?});/);
      if (additionalDataMatch) {
        try {
          const data = JSON.parse(additionalDataMatch[1]);
          const media = data?.graphql?.shortcode_media;
          if (media) {
            console.log('[Media Info] ✅ Found media via __additionalDataLoaded');
            return media;
          }
        } catch (e: any) {
          console.log('[Media Info] Failed to parse __additionalDataLoaded');
        }
      }

      // Method 2: application/json script tags (new format) - check ALL of them
      const jsonScriptRegex = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]+?)<\/script>/g;
      let jsonMatch;
      let scriptCount = 0;
      let lastError = '';
      
      while ((jsonMatch = jsonScriptRegex.exec(html)) !== null) {
        scriptCount++;
        try {
          const jsonContent = jsonMatch[1];
          const data = JSON.parse(jsonContent);
          
          // Check MANY possible locations for media data
          const media = 
            data?.props?.pageProps?.graphql?.shortcode_media ||
            data?.graphql?.shortcode_media ||
            data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media ||
            data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges?.[0]?.node ||
            data?.items?.[0] ||
            data?.media ||
            data?.shortcode_media ||
            (data?.require && data.require[0] && data.require[0][3] && data.require[0][3][0] && data.require[0][3][0].graphql?.shortcode_media);
          
          if (media) {
            console.log('[Media Info] ✅ Found media via application/json script #' + scriptCount);
            console.log('[Media Info] Media structure keys:', Object.keys(media).slice(0, 20));
            
            // Check if media has video_versions directly
            if (media.video_versions && Array.isArray(media.video_versions) && media.video_versions.length > 0) {
              const videoUrl = media.video_versions[0]?.url;
              if (videoUrl && (videoUrl.includes('scontent.cdninstagram.com') || videoUrl.includes('.mp4'))) {
                console.log('[Media Info] ✅ Found video_versions in media object:', videoUrl.substring(0, 150));
              }
            }
            
            // Check for clip property (Reels)
            if (media.clip) {
              console.log('[Media Info] Found clip property in media');
              if (media.clip.video_versions && Array.isArray(media.clip.video_versions) && media.clip.video_versions.length > 0) {
                const videoUrl = media.clip.video_versions[0]?.url;
                if (videoUrl) {
                  console.log('[Media Info] ✅ Found video in clip.video_versions:', videoUrl.substring(0, 150));
                }
              }
            }
            
            return media;
          }
          
          // Also check for nested structures that might contain video URLs
          // Sometimes Instagram nests the data differently
          const checkForVideoInData = (obj: any, path = '', depth = 0): any => {
            if (depth > 5) return null;
            if (!obj || typeof obj !== 'object') return null;
            
            // Check if this object has video_versions
            if (obj.video_versions && Array.isArray(obj.video_versions) && obj.video_versions.length > 0) {
              const videoUrl = obj.video_versions[0]?.url;
              if (videoUrl && (videoUrl.includes('scontent.cdninstagram.com') || videoUrl.includes('.mp4'))) {
                console.log('[Media Info] ✅ Found video_versions at path:', path);
                return obj;
              }
            }
            
            // Check for clip
            if (obj.clip && obj.clip.video_versions) {
              const videoUrl = obj.clip.video_versions[0]?.url;
              if (videoUrl && (videoUrl.includes('scontent.cdninstagram.com') || videoUrl.includes('.mp4'))) {
                console.log('[Media Info] ✅ Found clip.video_versions at path:', path);
                return obj;
              }
            }
            
            // Recursively check nested objects
            for (const key in obj) {
              if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
                const result = checkForVideoInData(obj[key], `${path}.${key}`, depth + 1);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          const foundMedia = checkForVideoInData(data);
          if (foundMedia) {
            console.log('[Media Info] ✅ Found media with video via recursive search in script #' + scriptCount);
            return foundMedia;
          }
          
          // Also check if this JSON contains video URLs directly
          const jsonString = JSON.stringify(data);
          if (jsonString.includes('video_url') || jsonString.includes('video_versions') || jsonString.includes('cdninstagram.com')) {
            console.log('[Media Info] Found video-related data in script #' + scriptCount);
            
            // Try to recursively search for video URLs in the data structure
            const findVideoUrl = (obj: any, depth = 0): string | null => {
              if (depth > 10) return null; // Prevent infinite recursion
              
              if (typeof obj === 'string' && obj.length > 50) {
                // Check if it's a video URL - Instagram videos are on scontent.cdninstagram.com
                // They might not have .mp4 extension in the URL path
                if (obj.startsWith('http') && 
                    (obj.includes('scontent.cdninstagram.com') || 
                     obj.includes('fbcdn.net') ||
                     obj.includes('cdninstagram.com/v/')) &&
                    !obj.includes('thumbnail') && 
                    !obj.includes('preview') &&
                    !obj.includes('.js') &&
                    !obj.includes('.css') &&
                    !obj.includes('rsrc.php') &&
                    !obj.includes('image') &&
                    !obj.includes('photo') &&
                    (obj.includes('.mp4') || 
                     obj.includes('/v/') || 
                     obj.includes('/video/') ||
                     obj.match(/\/v\/t[0-9]+\.[0-9]+\//) || // Instagram video URL pattern
                     obj.match(/\/v\/[0-9]+\//))) { // Another pattern
                  return obj;
                }
                return null;
              }
              
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  const url = findVideoUrl(item, depth + 1);
                  if (url) return url;
                }
                return null;
              }
              
              if (obj && typeof obj === 'object') {
                // Check common video URL properties
                if (obj.video_url) return findVideoUrl(obj.video_url, depth + 1);
                if (obj.url && typeof obj.url === 'string' && obj.url.includes('cdninstagram')) return obj.url;
                if (obj.video_versions && Array.isArray(obj.video_versions) && obj.video_versions.length > 0) {
                  const url = findVideoUrl(obj.video_versions[0], depth + 1);
                  if (url) return url;
                }
                if (obj.contentUrl) return findVideoUrl(obj.contentUrl, depth + 1);
                if (obj.playback_url) return findVideoUrl(obj.playback_url, depth + 1);
                
                // Recursively search all properties
                for (const key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    const url = findVideoUrl(obj[key], depth + 1);
                    if (url) return url;
                  }
                }
              }
              
              return null;
            };
            
            const videoUrl = findVideoUrl(data);
            // Validate it's actually a video file, not JS/CSS
            if (videoUrl && 
                (videoUrl.includes('.mp4') || 
                 videoUrl.includes('/v/') || 
                 videoUrl.includes('/video/') ||
                 videoUrl.includes('scontent.cdninstagram.com')) &&
                !videoUrl.includes('.js') &&
                !videoUrl.includes('.css') &&
                !videoUrl.includes('rsrc.php') &&
                !videoUrl.includes('thumbnail') &&
                !videoUrl.includes('image') &&
                !videoUrl.includes('photo')) {
              console.log('[Media Info] ✅ Found video URL in JSON structure:', videoUrl.substring(0, 150));
              return {
                video_versions: [{ url: videoUrl }],
                image_versions2: { candidates: [] },
                code: shortcode,
                media_type: 2,
                product_type: 'clips',
                caption: { text: '' },
                user: { username: '' },
              };
            } else if (videoUrl) {
              console.log('[Media Info] Rejected non-video URL from findVideoUrl:', videoUrl.substring(0, 100));
            }
            
            // Fallback: Try regex patterns on stringified JSON (must be actual video files)
            // Instagram video URLs can be on scontent.cdninstagram.com with /v/ path
            const videoUrlPatterns = [
              /"video_url"\s*:\s*"([^"]+scontent[^"]*cdninstagram[^"]+)"/,
              /"url"\s*:\s*"([^"]+scontent[^"]*cdninstagram[^"]+)"/,
              /"contentUrl"\s*:\s*"([^"]+scontent[^"]*cdninstagram[^"]+)"/,
              /"playback_url"\s*:\s*"([^"]+scontent[^"]*cdninstagram[^"]+)"/,
              /"src"\s*:\s*"([^"]+scontent[^"]*cdninstagram[^"]+)"/,
              /"video_versions"\s*:\s*\[\s*\{\s*"url"\s*:\s*"([^"]+scontent[^"]*cdninstagram[^"]+)"/,
              /https:\/\/[^"]*scontent[^"]*cdninstagram[^"]*(?:\/v\/[^"]*|\.mp4[^"]*)/,
              /https:\/\/[^"]*cdninstagram[^"]*(?:\/v\/[^"]*|\.mp4[^"]*)/,
            ];
            
            for (const pattern of videoUrlPatterns) {
              const match = jsonString.match(pattern);
              if (match && match[1]) {
                let videoUrl = match[1].replace(/\\\//g, '/')
                                      .replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)))
                                      .replace(/\\"/g, '"')
                                      .replace(/\\n/g, '')
                                      .replace(/\\/g, '');
                
                // Validate it's actually a video file (scontent.cdninstagram.com or has /v/ or .mp4)
                if ((videoUrl.includes('scontent.cdninstagram.com') || 
                     videoUrl.includes('/v/') || 
                     videoUrl.includes('.mp4')) &&
                    !videoUrl.includes('thumbnail') && 
                    !videoUrl.includes('.js') &&
                    !videoUrl.includes('.css') &&
                    !videoUrl.includes('rsrc.php') &&
                    !videoUrl.includes('image') &&
                    !videoUrl.includes('photo')) {
                  console.log('[Media Info] ✅ Found video URL via regex in script #' + scriptCount + ':', videoUrl.substring(0, 150));
                  return {
                    video_versions: [{ url: videoUrl }],
                    image_versions2: { candidates: [] },
                    code: shortcode,
                    media_type: 2,
                    product_type: 'clips',
                    caption: { text: '' },
                    user: { username: '' },
                  };
                }
              }
            }
          }
        } catch (e: any) {
          lastError = e.message?.substring(0, 50);
          // Continue to next match
        }
      }
      console.log(`[Media Info] Checked ${scriptCount} application/json script tags. Last error: ${lastError}`);
      
      // Method 2b: Deep search in all JSON scripts for video URLs (more thorough)
      if (scriptCount > 0) {
        console.log('[Media Info] Performing deep search in JSON scripts for video URLs...');
        const jsonScriptRegex2 = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]+?)<\/script>/g;
        let jsonMatch2;
        let deepSearchCount = 0;
        while ((jsonMatch2 = jsonScriptRegex2.exec(html)) !== null) {
          deepSearchCount++;
          try {
            const jsonContent = jsonMatch2[1];
            const data = JSON.parse(jsonContent);
            
            // Deep recursive search for any video URL
            const deepFindVideo = (obj: any, path = '', depth = 0): string | null => {
              if (depth > 15) return null;
              
              if (typeof obj === 'string' && obj.length > 50) {
                // Check if string contains video URL - Instagram videos on scontent.cdninstagram.com
                if (obj.includes('scontent.cdninstagram.com') || 
                    (obj.includes('cdninstagram.com') && (obj.includes('/v/') || obj.includes('/video/')))) {
                  // Extract the actual URL from the string
                  const urlMatch = obj.match(/https:\/\/[^\s"']+scontent[^\s"']*cdninstagram[^\s"']*(?:\/v\/[^\s"']*|\.mp4[^\s"']*)/) ||
                                  obj.match(/https:\/\/[^\s"']+cdninstagram[^\s"']*(?:\/v\/[^\s"']*|\.mp4[^\s"']*)/);
                  if (urlMatch && 
                      !urlMatch[0].includes('thumbnail') && 
                      !urlMatch[0].includes('.js') &&
                      !urlMatch[0].includes('.css') &&
                      !urlMatch[0].includes('rsrc.php') &&
                      !urlMatch[0].includes('image') &&
                      !urlMatch[0].includes('photo')) {
                    return urlMatch[0];
                  }
                }
              }
              
              if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                  const result = deepFindVideo(obj[i], `${path}[${i}]`, depth + 1);
                  if (result) return result;
                }
              } else if (obj && typeof obj === 'object') {
                for (const key in obj) {
                  if (obj.hasOwnProperty(key)) {
                    // Prioritize video-related keys
                    if (key.toLowerCase().includes('video') || key.toLowerCase().includes('url') || key.toLowerCase().includes('src')) {
                      const result = deepFindVideo(obj[key], `${path}.${key}`, depth + 1);
                      if (result) return result;
                    }
                  }
                }
                // Then search all other keys
                for (const key in obj) {
                  if (obj.hasOwnProperty(key) && !key.toLowerCase().includes('video') && !key.toLowerCase().includes('url')) {
                    const result = deepFindVideo(obj[key], `${path}.${key}`, depth + 1);
                    if (result) return result;
                  }
                }
              }
              
              return null;
            };
            
            const foundUrl = deepFindVideo(data);
            // Validate it's actually a video file
            if (foundUrl && 
                (foundUrl.includes('scontent.cdninstagram.com') ||
                 foundUrl.includes('.mp4') || 
                 foundUrl.includes('/v/') || 
                 foundUrl.includes('/video/')) &&
                !foundUrl.includes('.js') &&
                !foundUrl.includes('.css') &&
                !foundUrl.includes('rsrc.php') &&
                !foundUrl.includes('thumbnail') &&
                !foundUrl.includes('image') &&
                !foundUrl.includes('photo')) {
              console.log('[Media Info] ✅ Found video URL via deep search in script #' + deepSearchCount + ':', foundUrl.substring(0, 150));
              return {
                video_versions: [{ url: foundUrl }],
                image_versions2: { candidates: [] },
                code: shortcode,
                media_type: 2,
                product_type: 'clips',
                caption: { text: '' },
                user: { username: '' },
              };
            } else if (foundUrl) {
              console.log('[Media Info] Rejected URL from deep search:', foundUrl.substring(0, 100));
            }
          } catch (e: any) {
            // Continue
          }
        }
        console.log(`[Media Info] Deep search completed on ${deepSearchCount} scripts`);
      }

      // Method 3: Look for video URLs directly in various formats
      console.log('[Media Info] Searching for video URLs directly in HTML...');
      
      // Method 3a: VideoObject JSON-LD (with more flexible matching)
      const videoObjectPatterns = [
        /"@type"\s*:\s*"VideoObject"[\s\S]{0,5000}?"contentUrl"\s*:\s*"([^"]+)"/,
        /"@type"\s*:\s*"VideoObject"[\s\S]{0,5000}?"url"\s*:\s*"([^"]+)"/,
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type"\s*:\s*"VideoObject"[\s\S]*?"contentUrl"\s*:\s*"([^"]+)"/,
      ];
      
      for (const pattern of videoObjectPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          let videoUrl = match[1];
          videoUrl = videoUrl.replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)))
                            .replace(/\\\//g, '/')
                            .replace(/\\"/g, '"');
          
          // Validate it's a video URL (scontent.cdninstagram.com or has .mp4 or /v/)
          if ((videoUrl.includes('scontent.cdninstagram.com') ||
               videoUrl.includes('cdninstagram.com') && (videoUrl.includes('/v/') || videoUrl.includes('.mp4')) ||
               videoUrl.includes('fbcdn.net') || 
               videoUrl.includes('.mp4')) &&
              !videoUrl.includes('.js') &&
              !videoUrl.includes('.css') &&
              !videoUrl.includes('rsrc.php') &&
              !videoUrl.includes('thumbnail') &&
              !videoUrl.includes('image') &&
              !videoUrl.includes('photo')) {
            console.log('[Media Info] ✅ Found video URL via VideoObject:', videoUrl.substring(0, 100));
            return {
              video_versions: [{ url: videoUrl }],
              image_versions2: { candidates: [] },
              code: shortcode,
              media_type: 2,
              product_type: 'clips',
              caption: { text: '' },
              user: { username: '' },
            };
          }
        }
      }

      // Method 3b: Look for video URLs in JSON strings (more comprehensive)
      // Instagram videos are typically on scontent.cdninstagram.com with /v/ path
      const videoUrlPatterns = [
        /"video_url"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"contentUrl"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"video_versions"\s*:\s*\[\s*\{\s*"url"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"playback_url"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"dash_manifest"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"video_dash_manifest"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"video_urls"\s*:\s*\[\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"src"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        /"url"\s*:\s*"([^"]*scontent[^"]*cdninstagram[^"]+)"/,
        // Also check for /v/ path pattern
        /https:\/\/[^"]*scontent[^"]*cdninstagram[^"]*\/v\/[^"]+/,
      ];

      for (const pattern of videoUrlPatterns) {
        const matches = [];
        let match;
        const regex = new RegExp(pattern.source, 'g');
        while ((match = regex.exec(html)) !== null) {
          matches.push(match[1]);
        }
        
        for (const videoUrlRaw of matches) {
          let videoUrl = videoUrlRaw;
          // Decode unicode and URL encoding
          videoUrl = videoUrl.replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)))
                            .replace(/\\\//g, '/')
                            .replace(/\\"/g, '"')
                            .replace(/\\n/g, '')
                            .replace(/\\r/g, '');
          
          // Validate it's a video URL (scontent.cdninstagram.com or has /v/ or .mp4)
          if ((videoUrl.includes('scontent.cdninstagram.com') ||
               (videoUrl.includes('cdninstagram.com') && (videoUrl.includes('/v/') || videoUrl.includes('.mp4'))) ||
               videoUrl.includes('fbcdn.net') || 
               videoUrl.includes('.mp4')) &&
              !videoUrl.includes('thumbnail') && 
              !videoUrl.includes('preview') &&
              !videoUrl.includes('.js') &&
              !videoUrl.includes('.css') &&
              !videoUrl.includes('rsrc.php') &&
              !videoUrl.includes('image') &&
              !videoUrl.includes('photo')) {
            console.log('[Media Info] ✅ Found video URL via pattern:', pattern.toString().substring(0, 50));
            console.log('[Media Info] Video URL:', videoUrl.substring(0, 150));
            
            return {
              video_versions: [{ url: videoUrl }],
              image_versions2: { candidates: [] },
              code: shortcode,
              media_type: 2,
              product_type: 'clips',
              caption: { text: '' },
              user: { username: '' },
            };
          }
        }
      }

      // Method 4: Direct MP4 URLs in HTML
      const directVideoRegex = /https:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/g;
      let directVideoMatch;
      while ((directVideoMatch = directVideoRegex.exec(html)) !== null) {
        const videoUrl = directVideoMatch[0];
        if (videoUrl.includes('cdninstagram.com') || videoUrl.includes('fbcdn.net')) {
          console.log('[Media Info] ✅ Found direct video URL in HTML:', videoUrl.substring(0, 100));
          return {
            video_versions: [{ url: videoUrl }],
            image_versions2: { candidates: [] },
            code: shortcode,
            media_type: 2,
            product_type: 'clips',
            caption: { text: '' },
            user: { username: '' },
          };
        }
      }

      // Method 5: Try to find any Instagram CDN video URL (multiple patterns)
      // Instagram videos are on scontent.cdninstagram.com with /v/ path
      const cdnVideoPatterns = [
        /https:\/\/[^"'\s<>]*scontent[^"'\s<>]*cdninstagram[^"'\s<>]*\/v\/[^"'\s<>]+/,
        /https:\/\/[^"'\s<>]*scontent[^"'\s<>]*cdninstagram[^"'\s<>]*\.mp4[^"'\s<>]*/,
        /https:\/\/[^"'\s<>]*cdninstagram\.com[^"'\s<>]*\.mp4[^"'\s<>]*/,
        /https:\/\/[^"'\s<>]*fbcdn\.net[^"'\s<>]*\.mp4[^"'\s<>]*/,
        /https:\/\/[^"'\s<>]*video[^"'\s<>]*cdninstagram[^"'\s<>]*/,
      ];
      
      for (const pattern of cdnVideoPatterns) {
        const matches = [];
        let match;
        const regex = new RegExp(pattern.source, 'g');
        while ((match = regex.exec(html)) !== null) {
          const url = match[0];
          // Filter out thumbnails, previews, and non-video files
          if (!url.includes('thumbnail') && 
              !url.includes('preview') && 
              !url.includes('_n.jpg') &&
              !url.includes('.js') &&
              !url.includes('.css') &&
              !url.includes('rsrc.php') &&
              !url.includes('image') &&
              !url.includes('photo')) {
            matches.push(url);
          }
        }
        
        if (matches.length > 0) {
          // Get the longest URL (usually highest quality)
          const videoUrl = matches.sort((a, b) => b.length - a.length)[0];
          console.log('[Media Info] ✅ Found CDN video URL:', videoUrl.substring(0, 150));
          return {
            video_versions: [{ url: videoUrl }],
            image_versions2: { candidates: [] },
            code: shortcode,
            media_type: 2,
            product_type: 'clips',
            caption: { text: '' },
            user: { username: '' },
          };
        }
      }

      // Method 6: Search ALL script tags for video URLs (even non-JSON)
      console.log('[Media Info] Searching all script tags for video URLs...');
      const allScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
      let scriptMatch;
      let allScriptCount = 0;
      while ((scriptMatch = allScriptRegex.exec(html)) !== null) {
        allScriptCount++;
        const scriptContent = scriptMatch[1];
        
        // Look for video URLs in any script - Instagram uses scontent.cdninstagram.com/v/
        const videoInScript = scriptContent.match(/https:\/\/[^"'\s<>]*scontent[^"'\s<>]*cdninstagram[^"'\s<>]*\/v\/[^"'\s<>]+/) ||
                              scriptContent.match(/https:\/\/[^"'\s<>]*scontent[^"'\s<>]*cdninstagram[^"'\s<>]*\.mp4[^"'\s<>]*/) ||
                              scriptContent.match(/https:\/\/[^"'\s<>]*cdninstagram[^"'\s<>]*\.mp4[^"'\s<>]*/);
        if (videoInScript && 
            !videoInScript[0].includes('thumbnail') &&
            !videoInScript[0].includes('preview') &&
            !videoInScript[0].includes('.js') &&
            !videoInScript[0].includes('.css') &&
            !videoInScript[0].includes('rsrc.php')) {
          console.log('[Media Info] ✅ Found video URL in script tag #' + allScriptCount);
          return {
            video_versions: [{ url: videoInScript[0] }],
            image_versions2: { candidates: [] },
            code: shortcode,
            media_type: 2,
            product_type: 'clips',
            caption: { text: '' },
            user: { username: '' },
          };
        }
      }
      console.log(`[Media Info] Checked ${allScriptCount} total script tags`);
      
      // Method 6b: Final aggressive search for ANY scontent.cdninstagram.com URL in entire HTML
      console.log('[Media Info] Performing final aggressive search for scontent URLs...');
      const finalAggressivePattern = /https:\/\/[^"'\s<>]+scontent[^"'\s<>]*cdninstagram[^"'\s<>]*\/v\/[^"'\s<>]+/g;
      const finalMatches: string[] = [];
      let finalMatch;
      while ((finalMatch = finalAggressivePattern.exec(html)) !== null) {
        let url = finalMatch[0].replace(/[<>"']+$/, '').replace(/\\/g, '').replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
        // Clean up URL - remove any trailing invalid characters
        url = url.split(/[<>"'\s]/)[0];
        if (url && 
            url.includes('scontent.cdninstagram.com/v/') &&
            !url.includes('thumbnail') &&
            !url.includes('preview') &&
            !url.includes('.js') &&
            !url.includes('.css') &&
            !url.includes('rsrc.php') &&
            !url.includes('image') &&
            !url.includes('photo')) {
          finalMatches.push(url);
        }
      }
      
      if (finalMatches.length > 0) {
        // Remove duplicates and get the longest URL (usually highest quality)
        const uniqueUrls = Array.from(new Set(finalMatches));
        const videoUrl = uniqueUrls.sort((a, b) => b.length - a.length)[0];
        console.log('[Media Info] ✅ Found video URL via final aggressive search:', videoUrl.substring(0, 200));
        console.log('[Media Info] Total unique matches:', uniqueUrls.length);
        return {
          video_versions: [{ url: videoUrl }],
          image_versions2: { candidates: [] },
          code: shortcode,
          media_type: 2,
          product_type: 'clips',
          caption: { text: '' },
          user: { username: '' },
        };
      } else {
        console.log('[Media Info] No scontent.cdninstagram.com/v/ URLs found in HTML');
      }

      // Method 7: Look for base64 encoded or escaped URLs
      const escapedUrlPattern = /(?:\\u002F|%2F|\\\/)[^"'\s]*cdninstagram[^"'\s]*\.mp4[^"'\s]*/g;
      let escapedMatch;
      while ((escapedMatch = escapedUrlPattern.exec(html)) !== null) {
        let videoUrl = 'https://' + escapedMatch[0]
          .replace(/\\u002F/g, '/')
          .replace(/\\\//g, '/')
          .replace(/%2F/g, '/')
          .replace(/\\"/g, '');
        
        if (!videoUrl.includes('thumbnail')) {
          console.log('[Media Info] ✅ Found escaped video URL:', videoUrl.substring(0, 150));
          return {
            video_versions: [{ url: videoUrl }],
            image_versions2: { candidates: [] },
            code: shortcode,
            media_type: 2,
            product_type: 'clips',
            caption: { text: '' },
            user: { username: '' },
          };
        }
      }

      console.error('[Media Info] ❌ Could not extract media from HTML');
      
      // More detailed analysis
      const scontentMatches = (html.match(/scontent[^"'\s<>]*cdninstagram/g) || []).length;
      const videoPathMatches = (html.match(/\/v\/[^"'\s<>]+/g) || []).length;
      const mp4Matches = (html.match(/\.mp4/g) || []).length;
      
      console.error('[Media Info] HTML analysis:', {
        hasSharedData: html.includes('_sharedData'),
        hasAdditionalData: html.includes('__additionalDataLoaded'),
        hasVideoObject: html.includes('VideoObject'),
        hasCdnInstagram: html.includes('cdninstagram.com'),
        hasScontent: html.includes('scontent.cdninstagram.com'),
        scontentMatches: scontentMatches,
        videoPathMatches: videoPathMatches,
        mp4Matches: mp4Matches,
        hasMp4: html.includes('.mp4'),
        scriptTagCount: (html.match(/<script/g) || []).length,
        jsonScriptCount: (html.match(/type=["']application\/json["']/g) || []).length,
      });
      
      // Log a sample of scontent URLs found (if any)
      const sampleScontentUrls = html.match(/https:\/\/[^"'\s<>]+scontent[^"'\s<>]*cdninstagram[^"'\s<>]+/g);
      if (sampleScontentUrls && sampleScontentUrls.length > 0) {
        console.error('[Media Info] Sample scontent URLs found (first 5):', sampleScontentUrls.slice(0, 5).map((u: string) => u.substring(0, 150)));
      } else {
        console.error('[Media Info] No scontent.cdninstagram.com URLs found in HTML');
      }
      
      // Save a sample for debugging (first 5000 chars)
      console.error('[Media Info] HTML sample:', html.substring(0, 5000));
      return null;
  }

  /**
   * Get media by shortcode (for posts/reels)
   * Extracts shortcode from URL like: https://www.instagram.com/reel/ABC123/
   */
  async getMediaByShortcode(cookies: InstagramCookies, shortcode: string): Promise<any | null> {
    try {
      console.log('[Media Info] Fetching media for shortcode:', shortcode);
      
      // Use ONLY web scraping with cookies (no API fallback)
      // The API method requires media ID, not shortcode, so it doesn't work
      console.log('[Media Info] Using web scraping method with cookies...');
      const mediaInfo = await this.getMediaByShortcodeWeb(shortcode, cookies);
      
      if (mediaInfo) {
        console.log('[Media Info] ✅ Successfully got media via web scrape');
        return this.formatMediaInfo(mediaInfo, shortcode);
      }
      
      console.error('[Media Info] ❌ Web scraping failed. Shortcode:', shortcode);
      return null;
    } catch (error: any) {
      console.error('[Media Info] Unexpected error:', {
        shortcode,
        error: error.message,
        stack: error.stack?.substring(0, 500),
      });
      return null;
    }
  }

  /**
   * Extract media object from API response
   */
  private extractMediaFromResponse(response: any): any | null {
    if (Array.isArray(response)) {
      return response[0];
    } else if (response && typeof response === 'object') {
      if ((response as any).items && Array.isArray((response as any).items) && (response as any).items.length > 0) {
        return (response as any).items[0];
      } else if ((response as any).pk || (response as any).id || (response as any).code) {
        return response;
      } else if ((response as any).media) {
        return (response as any).media;
      } else if ((response as any).data) {
        const data = (response as any).data;
        if (data.items && Array.isArray(data.items)) {
          return data.items[0];
        } else if (data.pk || data.id || data.code) {
          return data;
        }
      }
    }
    return null;
  }

  /**
   * Format media info into consistent structure
   */
  private formatMediaInfo(mediaInfo: any, shortcode: string): any {
    const videoUrl = this.extractVideoUrl(mediaInfo);
    
    // Only extract thumbnail if mediaInfo has the structure, otherwise use empty
    let thumbnailUrl: string | null = null;
    try {
      thumbnailUrl = this.extractThumbnailUrl(mediaInfo);
    } catch (e: any) {
      console.log('[Media Info] Could not extract thumbnail:', e.message?.substring(0, 50));
      thumbnailUrl = null;
    }
    
    console.log('[Media Info] Formatted media info:', {
      hasVideoUrl: !!videoUrl,
      hasThumbnail: !!thumbnailUrl,
      isVideo: mediaInfo.media_type === 2 || mediaInfo.product_type === 'clips',
    });
    
    return {
      id: mediaInfo.id || mediaInfo.pk,
      shortcode: mediaInfo.code || shortcode,
      type: mediaInfo.product_type || mediaInfo.media_type,
      caption: mediaInfo.caption?.text || mediaInfo.caption || '',
      username: mediaInfo.user?.username || mediaInfo.owner?.username || '',
      timestamp: mediaInfo.taken_at,
      likeCount: mediaInfo.like_count || 0,
      commentCount: mediaInfo.comment_count || 0,
      videoUrl,
      thumbnailUrl,
      isVideo: mediaInfo.media_type === 2 || mediaInfo.product_type === 'clips',
    };
  }

  /**
   * Extract video URL from media info
   * Handles multiple possible locations for video URLs in Instagram's API response
   */
  private extractVideoUrl(mediaInfo: any): string | null {
    if (!mediaInfo) {
      console.log('[Extract Video] No media info provided');
      return null;
    }

    console.log('[Extract Video] Searching for video URL in media info...');
    console.log('[Extract Video] Media info keys:', Object.keys(mediaInfo));

    // Method 1: video_versions array (most common for Reels)
    if (mediaInfo.video_versions && Array.isArray(mediaInfo.video_versions) && mediaInfo.video_versions.length > 0) {
      // Sort by quality/width to get highest quality
      const sorted = [...mediaInfo.video_versions].sort((a: any, b: any) => {
        const widthA = a.width || 0;
        const widthB = b.width || 0;
        return widthB - widthA;
      });
      const videoUrl = sorted[0]?.url;
      
      // Validate it's actually a video file, not JS/CSS
      if (videoUrl && 
          (videoUrl.includes('.mp4') || videoUrl.includes('/video/')) &&
          !videoUrl.includes('.js') &&
          !videoUrl.includes('.css') &&
          !videoUrl.includes('rsrc.php')) {
        console.log('[Extract Video] Found in video_versions:', videoUrl.substring(0, 100));
        return videoUrl;
      } else if (videoUrl) {
        console.log('[Extract Video] Rejected non-video URL from video_versions:', videoUrl.substring(0, 100));
      }
    }

    // Method 2: Direct video_url property
    if (mediaInfo.video_url) {
      // Validate it's actually a video file
      if (mediaInfo.video_url.includes('.mp4') && 
          !mediaInfo.video_url.includes('.js') &&
          !mediaInfo.video_url.includes('rsrc.php')) {
        console.log('[Extract Video] Found in video_url:', mediaInfo.video_url.substring(0, 100));
        return mediaInfo.video_url;
      }
    }

    // Method 3: video property
    if (mediaInfo.video?.url) {
      // Validate it's actually a video file
      if (mediaInfo.video.url.includes('.mp4') && 
          !mediaInfo.video.url.includes('.js') &&
          !mediaInfo.video.url.includes('rsrc.php')) {
        console.log('[Extract Video] Found in video.url:', mediaInfo.video.url.substring(0, 100));
        return mediaInfo.video.url;
      }
    }

    // Method 4: clip property (for Reels)
    if (mediaInfo.clip?.video_versions && Array.isArray(mediaInfo.clip.video_versions) && mediaInfo.clip.video_versions.length > 0) {
      const videoUrl = mediaInfo.clip.video_versions[0]?.url;
      // Validate it's actually a video file
      if (videoUrl && 
          (videoUrl.includes('.mp4') || videoUrl.includes('/video/')) &&
          !videoUrl.includes('.js') &&
          !videoUrl.includes('rsrc.php')) {
        console.log('[Extract Video] Found in clip.video_versions:', videoUrl.substring(0, 100));
        return videoUrl;
      }
    }

    // Method 5: For carousel videos
    if (mediaInfo.carousel_media && Array.isArray(mediaInfo.carousel_media)) {
      for (const item of mediaInfo.carousel_media) {
        if (item.video_versions && Array.isArray(item.video_versions) && item.video_versions.length > 0) {
          const videoUrl = item.video_versions[0]?.url;
          // Validate it's actually a video file
          if (videoUrl && 
              (videoUrl.includes('.mp4') || videoUrl.includes('/video/')) &&
              !videoUrl.includes('.js') &&
              !videoUrl.includes('rsrc.php')) {
            console.log('[Extract Video] Found in carousel_media:', videoUrl.substring(0, 100));
            return videoUrl;
          }
        }
        if (item.video_url) {
          // Validate it's actually a video file
          if (item.video_url.includes('.mp4') && 
              !item.video_url.includes('.js') &&
              !item.video_url.includes('rsrc.php')) {
            console.log('[Extract Video] Found in carousel_media.video_url:', item.video_url.substring(0, 100));
            return item.video_url;
          }
        }
      }
    }

    // Method 6: Check nested structures
    if (mediaInfo.items && Array.isArray(mediaInfo.items)) {
      for (const item of mediaInfo.items) {
        const url = this.extractVideoUrl(item);
        if (url) return url;
      }
    }

    // Method 7: Check for contentUrl (from web scraping)
    if (mediaInfo.contentUrl) {
      // Validate it's actually a video file
      if (mediaInfo.contentUrl.includes('.mp4') && 
          !mediaInfo.contentUrl.includes('.js') &&
          !mediaInfo.contentUrl.includes('rsrc.php')) {
        console.log('[Extract Video] Found in contentUrl:', mediaInfo.contentUrl.substring(0, 100));
        return mediaInfo.contentUrl;
      }
    }

    // Log what we found for debugging
    console.error('[Extract Video] No video URL found. Available properties:', {
      hasVideoVersions: !!mediaInfo.video_versions,
      hasVideoUrl: !!mediaInfo.video_url,
      hasVideo: !!mediaInfo.video,
      hasClip: !!mediaInfo.clip,
      hasCarousel: !!mediaInfo.carousel_media,
      mediaType: mediaInfo.media_type,
      productType: mediaInfo.product_type,
    });

    return null;
  }

  /**
   * Extract thumbnail URL from media info
   */
  private extractThumbnailUrl(mediaInfo: any): string | null {
    if (!mediaInfo) {
      return null;
    }

    // For images
    if (mediaInfo.image_versions2?.candidates && Array.isArray(mediaInfo.image_versions2.candidates) && mediaInfo.image_versions2.candidates.length > 0) {
      const candidate = mediaInfo.image_versions2.candidates[0];
      if (candidate && candidate.url) {
        return candidate.url;
      }
    }

    // Fallback
    if (mediaInfo.thumbnail_url) {
      return mediaInfo.thumbnail_url;
    }

    return null;
  }
}

export const instagramCookieService = new InstagramCookieService();

