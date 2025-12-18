import { randomBytes } from 'crypto';
import { prisma } from '../prisma/client';

// ============================================================================
// Types
// ============================================================================

interface OAuthState {
  workspaceId: string;
  userId: string;
  nonce: string;
}

interface MetaLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface InstagramBusinessAccount {
  id: string;
  username: string;
  profile_picture_url?: string;
  followers_count?: number;
}

interface ConnectedAccountResult {
  id: string;
  igUsername: string;
  igUserId: string;
}

// ============================================================================
// Service
// ============================================================================

export class InstagramOAuthService {
  // In-memory state store (use Redis in production)
  private oauthStateStore: Map<string, OAuthState> = new Map();

  /**
   * Generates the Meta OAuth authorization URL.
   */
  async startOAuth(workspaceId: string, userId: string): Promise<string> {
    const clientId = process.env.META_APP_ID;
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Meta OAuth is not configured');
    }

    // Generate state parameter for CSRF protection
    const nonce = randomBytes(16).toString('hex');
    const state: OAuthState = { workspaceId, userId, nonce };
    const stateToken = Buffer.from(JSON.stringify(state)).toString('base64url');

    // Store state for validation (TTL should be ~10 minutes in production)
    this.oauthStateStore.set(stateToken, state);

    // Required permissions for Instagram messaging
    const scopes = [
      'instagram_basic',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_messaging',
      'pages_read_engagement',
    ].join(',');

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', stateToken);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');

    return authUrl.toString();
  }

  /**
   * Handles the OAuth callback from Meta.
   */
  async handleOAuthCallback(code: string, stateToken: string): Promise<ConnectedAccountResult> {
    // Validate state
    const state = this.oauthStateStore.get(stateToken);
    if (!state) {
      throw new Error('Invalid or expired OAuth state');
    }
    this.oauthStateStore.delete(stateToken);

    const { workspaceId } = state;

    // Step 1: Exchange code for short-lived access token
    const shortLivedToken = await this.exchangeCodeForToken(code);

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedToken = await this.exchangeForLongLivedToken(shortLivedToken);

    // Step 3: Get Facebook Pages linked to this user
    const pages = await this.getFacebookPages(longLivedToken.access_token);

    // Step 4: Find pages with Instagram Business accounts
    const pageWithIg = pages.find((page) => page.instagram_business_account);
    if (!pageWithIg || !pageWithIg.instagram_business_account) {
      throw new Error(
        'No Instagram Business account found. Please link an Instagram Business account to your Facebook Page.',
      );
    }

    // Step 5: Get Instagram account details
    const igAccount = await this.getInstagramAccountDetails(
      pageWithIg.instagram_business_account.id,
      pageWithIg.access_token,
    );

    // Step 6: Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + longLivedToken.expires_in);

    // Step 7: Save or update the Instagram account
    const savedAccount = await prisma.instagramAccount.upsert({
      where: {
        igUserId_workspaceId: {
          igUserId: igAccount.id,
          workspaceId,
        },
      },
      update: {
        igUsername: igAccount.username,
        fbPageId: pageWithIg.id,
        accessToken: this.encryptToken(pageWithIg.access_token),
        accessTokenExpiresAt: expiresAt,
        profilePictureUrl: igAccount.profile_picture_url,
        isActive: true,
        permissions: [
          'instagram_basic',
          'instagram_manage_messages',
          'pages_messaging',
        ],
      },
      create: {
        workspaceId,
        igUserId: igAccount.id,
        igUsername: igAccount.username,
        fbPageId: pageWithIg.id,
        accessToken: this.encryptToken(pageWithIg.access_token),
        accessTokenExpiresAt: expiresAt,
        profilePictureUrl: igAccount.profile_picture_url,
        permissions: [
          'instagram_basic',
          'instagram_manage_messages',
          'pages_messaging',
        ],
      },
    });

    console.log(
      `Connected Instagram account ${igAccount.username} (${igAccount.id}) to workspace ${workspaceId}`,
    );

    return {
      id: savedAccount.id,
      igUsername: savedAccount.igUsername,
      igUserId: savedAccount.igUserId,
    };
  }

  /**
   * Lists all Instagram accounts for a workspace.
   */
  async listAccounts(workspaceId: string) {
    return prisma.instagramAccount.findMany({
      where: { workspaceId },
      select: {
        id: true,
        igUserId: true,
        igUsername: true,
        profilePictureUrl: true,
        isActive: true,
        dailyDmLimit: true,
        dmsSentToday: true,
        createdAt: true,
      },
    });
  }

  /**
   * Disconnects an Instagram account.
   */
  async disconnectAccount(workspaceId: string, accountId: string) {
    const account = await prisma.instagramAccount.findFirst({
      where: { id: accountId, workspaceId },
    });

    if (!account) {
      throw new Error('Instagram account not found');
    }

    await prisma.instagramAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return { success: true };
  }

  // ==========================================================================
  // Meta API Helpers (TODO: Implement actual HTTP calls)
  // ==========================================================================

  private async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI;

    // TODO: Implement actual API call
    // POST https://graph.facebook.com/v18.0/oauth/access_token
    throw new Error(
      'Meta API integration not implemented. Implement exchangeCodeForToken() with actual HTTP calls.',
    );
  }

  private async exchangeForLongLivedToken(
    shortLivedToken: string,
  ): Promise<MetaLongLivedTokenResponse> {
    // TODO: Implement actual API call
    // GET https://graph.facebook.com/v18.0/oauth/access_token
    throw new Error(
      'Meta API integration not implemented. Implement exchangeForLongLivedToken() with actual HTTP calls.',
    );
  }

  private async getFacebookPages(accessToken: string): Promise<FacebookPage[]> {
    // TODO: Implement actual API call
    // GET https://graph.facebook.com/v18.0/me/accounts
    throw new Error(
      'Meta API integration not implemented. Implement getFacebookPages() with actual HTTP calls.',
    );
  }

  private async getInstagramAccountDetails(
    igAccountId: string,
    pageAccessToken: string,
  ): Promise<InstagramBusinessAccount> {
    // TODO: Implement actual API call
    // GET https://graph.facebook.com/v18.0/{ig-user-id}
    throw new Error(
      'Meta API integration not implemented. Implement getInstagramAccountDetails() with actual HTTP calls.',
    );
  }

  private encryptToken(token: string): string {
    // TODO: Implement proper encryption
    console.warn('Token encryption not implemented - storing token in plaintext');
    return token;
  }
}

export const instagramOAuthService = new InstagramOAuthService();

