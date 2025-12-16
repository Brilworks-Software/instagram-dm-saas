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
      },
    });

    return {
      id: account.id,
      igUsername: account.igUsername,
    };
  }
}

export const instagramCookieService = new InstagramCookieService();

