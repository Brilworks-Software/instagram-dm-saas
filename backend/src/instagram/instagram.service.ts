import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

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

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

interface WebhookEntry {
  id: string;
  time: number;
  messaging?: WebhookMessagingEvent[];
  changes?: WebhookChangeEvent[];
}

interface WebhookMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: { url: string };
    }>;
    is_deleted?: boolean;
  };
  read?: { watermark: number };
  delivery?: { mids: string[]; watermark: number };
}

interface WebhookChangeEvent {
  field: string;
  value: unknown;
}

interface ConnectedAccountResult {
  id: string;
  igUsername: string;
  igUserId: string;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  // In-memory state store (use Redis in production)
  private oauthStateStore: Map<string, OAuthState> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==========================================================================
  // OAuth Flow
  // ==========================================================================

  /**
   * Generates the Meta OAuth authorization URL.
   * The user should be redirected to this URL to grant permissions.
   */
  async startOAuth(workspaceId: string, userId: string): Promise<string> {
    const clientId = this.configService.get<string>('META_APP_ID');
    const redirectUri = this.configService.get<string>('META_OAUTH_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new BadRequestException('Meta OAuth is not configured');
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
   * Exchanges code for tokens and saves the Instagram account.
   */
  async handleOAuthCallback(code: string, stateToken: string): Promise<ConnectedAccountResult> {
    // Validate state
    const state = this.oauthStateStore.get(stateToken);
    if (!state) {
      throw new BadRequestException('Invalid or expired OAuth state');
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
      throw new BadRequestException(
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
    const savedAccount = await this.prisma.instagramAccount.upsert({
      where: {
        igUserId_workspaceId: {
          igUserId: igAccount.id,
          workspaceId,
        },
      },
      update: {
        igUsername: igAccount.username,
        fbPageId: pageWithIg.id,
        accessToken: this.encryptToken(pageWithIg.access_token), // Page token for messaging
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

    this.logger.log(
      `Connected Instagram account ${igAccount.username} (${igAccount.id}) to workspace ${workspaceId}`,
    );

    return {
      id: savedAccount.id,
      igUsername: savedAccount.igUsername,
      igUserId: savedAccount.igUserId,
    };
  }

  // ==========================================================================
  // Webhook Handling
  // ==========================================================================

  /**
   * Processes incoming webhook events from Meta.
   */
  async receiveWebhook(payload: WebhookPayload): Promise<void> {
    for (const entry of payload.entry) {
      // Handle messaging events (DMs)
      if (entry.messaging?.length) {
        for (const event of entry.messaging) {
          await this.handleMessagingEvent(entry.id, event);
        }
      }

      // Handle other changes (mentions, comments, etc.)
      if (entry.changes?.length) {
        for (const change of entry.changes) {
          await this.handleChangeEvent(entry.id, change);
        }
      }
    }
  }

  /**
   * Handles individual messaging events (new message, read, delivery).
   */
  private async handleMessagingEvent(
    igAccountId: string,
    event: WebhookMessagingEvent,
  ): Promise<void> {
    this.logger.debug(`Processing messaging event from ${event.sender.id}`);

    // Find the Instagram account
    const igAccount = await this.prisma.instagramAccount.findFirst({
      where: { igUserId: igAccountId },
    });

    if (!igAccount) {
      this.logger.warn(`Received webhook for unknown Instagram account: ${igAccountId}`);
      return;
    }

    // Handle new message
    if (event.message && !event.message.is_deleted) {
      await this.handleIncomingMessage(igAccount.id, event);
    }

    // Handle message read
    if (event.read) {
      await this.handleMessageRead(igAccount.id, event.sender.id, event.read.watermark);
    }

    // Handle message delivery
    if (event.delivery) {
      await this.handleMessageDelivery(event.delivery.mids);
    }
  }

  /**
   * Processes an incoming DM message.
   */
  private async handleIncomingMessage(
    instagramAccountId: string,
    event: WebhookMessagingEvent,
  ): Promise<void> {
    const senderId = event.sender.id;
    const message = event.message!;

    // Find or create contact
    let contact = await this.prisma.contact.findFirst({
      where: {
        igUserId: senderId,
        workspace: {
          instagramAccounts: {
            some: { id: instagramAccountId },
          },
        },
      },
    });

    if (!contact) {
      // Get Instagram account to find workspace
      const igAccount = await this.prisma.instagramAccount.findUnique({
        where: { id: instagramAccountId },
      });

      if (!igAccount) return;

      // Create contact (username will be fetched separately if needed)
      contact = await this.prisma.contact.create({
        data: {
          workspaceId: igAccount.workspaceId,
          igUserId: senderId,
        },
      });
    }

    // Find or create conversation
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        instagramAccountId_contactId: {
          instagramAccountId,
          contactId: contact.id,
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          instagramAccountId,
          contactId: contact.id,
          status: 'OPEN',
        },
      });
    }

    // Check for duplicate message
    const existingMessage = await this.prisma.message.findUnique({
      where: { igMessageId: message.mid },
    });

    if (existingMessage) {
      this.logger.debug(`Duplicate message ${message.mid}, skipping`);
      return;
    }

    // Determine message type and content
    let messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' = 'TEXT';
    let content = message.text || '';
    let metadata: object | undefined = undefined;

    if (message.attachments?.length) {
      const attachment = message.attachments[0];
      messageType = attachment.type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO';
      metadata = { attachments: message.attachments };
      if (!content) {
        content = `[${attachment.type}]`;
      }
    }

    // Save the message
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        igMessageId: message.mid,
        content,
        messageType,
        direction: 'INBOUND',
        status: 'DELIVERED',
        deliveredAt: new Date(event.timestamp),
        metadata: metadata as any,
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(event.timestamp),
        unreadCount: { increment: 1 },
        status: 'OPEN',
      },
    });

    this.logger.log(`Saved incoming message ${message.mid} to conversation ${conversation.id}`);

    // Send notification for new message
    const igAccount = await this.prisma.instagramAccount.findUnique({
      where: { id: instagramAccountId },
      include: { workspace: true },
    });

    if (igAccount) {
      const contactName = contact.name || contact.igUsername || 'Someone';
      const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      
      await this.notificationService.createNotification(
        igAccount.workspaceId,
        'NEW_MESSAGE',
        `New message from ${contactName}`,
        messagePreview,
        {
          conversationId: conversation.id,
          contactId: contact.id,
          messageId: message.mid,
        },
      );
    }

    // TODO: Queue AI classification and suggested reply generation
  }

  /**
   * Updates message read status.
   */
  private async handleMessageRead(
    instagramAccountId: string,
    senderId: string,
    watermark: number,
  ): Promise<void> {
    // Mark outbound messages as read up to watermark timestamp
    const readAt = new Date(watermark);

    await this.prisma.message.updateMany({
      where: {
        conversation: {
          instagramAccountId,
          contact: { igUserId: senderId },
        },
        direction: 'OUTBOUND',
        status: { in: ['SENT', 'DELIVERED'] },
        sentAt: { lte: readAt },
      },
      data: {
        status: 'READ',
        readAt,
      },
    });
  }

  /**
   * Updates message delivery status.
   */
  private async handleMessageDelivery(messageIds: string[]): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        igMessageId: { in: messageIds },
        status: 'SENT',
      },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
  }

  /**
   * Handles non-messaging webhook changes.
   */
  private async handleChangeEvent(
    igAccountId: string,
    change: WebhookChangeEvent,
  ): Promise<void> {
    this.logger.debug(`Received change event: ${change.field} for account ${igAccountId}`);

    // Handle story mentions, comments, etc. in the future
    switch (change.field) {
      case 'mentions':
        // TODO: Handle story mentions
        break;
      case 'comments':
        // TODO: Handle comments if needed
        break;
      default:
        this.logger.debug(`Unhandled change field: ${change.field}`);
    }
  }

  // ==========================================================================
  // Account Management
  // ==========================================================================

  /**
   * Lists all Instagram accounts for a workspace.
   */
  async listAccounts(workspaceId: string) {
    return this.prisma.instagramAccount.findMany({
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
    const account = await this.prisma.instagramAccount.findFirst({
      where: { id: accountId, workspaceId },
    });

    if (!account) {
      throw new NotFoundException('Instagram account not found');
    }

    await this.prisma.instagramAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return { success: true };
  }

  // ==========================================================================
  // Meta API Helpers (Stubbed - Implement actual HTTP calls)
  // ==========================================================================

  /**
   * Exchanges authorization code for short-lived access token.
   */
  private async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = this.configService.get<string>('META_APP_ID');
    const clientSecret = this.configService.get<string>('META_APP_SECRET');
    const redirectUri = this.configService.get<string>('META_OAUTH_REDIRECT_URI');

    // TODO: Implement actual API call
    // POST https://graph.facebook.com/v18.0/oauth/access_token
    // ?client_id={app-id}
    // &redirect_uri={redirect-uri}
    // &client_secret={app-secret}
    // &code={code}

    this.logger.debug(`Exchanging code for token (stubbed) - code: ${code.substring(0, 10)}...`);
    this.logger.debug(`Using clientId: ${clientId}, redirectUri: ${redirectUri}`);

    // Stub response for development
    throw new BadRequestException(
      'Meta API integration not implemented. Implement exchangeCodeForToken() with actual HTTP calls.',
    );
  }

  /**
   * Exchanges short-lived token for long-lived token.
   */
  private async exchangeForLongLivedToken(
    shortLivedToken: string,
  ): Promise<MetaLongLivedTokenResponse> {
    const clientId = this.configService.get<string>('META_APP_ID');
    const clientSecret = this.configService.get<string>('META_APP_SECRET');

    // TODO: Implement actual API call
    // GET https://graph.facebook.com/v18.0/oauth/access_token
    // ?grant_type=fb_exchange_token
    // &client_id={app-id}
    // &client_secret={app-secret}
    // &fb_exchange_token={short-lived-token}

    this.logger.debug(`Exchanging for long-lived token (stubbed) - clientId: ${clientId}`);

    throw new BadRequestException(
      'Meta API integration not implemented. Implement exchangeForLongLivedToken() with actual HTTP calls.',
    );
  }

  /**
   * Gets Facebook Pages the user has access to.
   */
  private async getFacebookPages(accessToken: string): Promise<FacebookPage[]> {
    // TODO: Implement actual API call
    // GET https://graph.facebook.com/v18.0/me/accounts
    // ?fields=id,name,access_token,instagram_business_account
    // &access_token={user-access-token}

    this.logger.debug(`Getting Facebook pages (stubbed) - token: ${accessToken.substring(0, 10)}...`);

    throw new BadRequestException(
      'Meta API integration not implemented. Implement getFacebookPages() with actual HTTP calls.',
    );
  }

  /**
   * Gets Instagram Business account details.
   */
  private async getInstagramAccountDetails(
    igAccountId: string,
    pageAccessToken: string,
  ): Promise<InstagramBusinessAccount> {
    // TODO: Implement actual API call
    // GET https://graph.facebook.com/v18.0/{ig-user-id}
    // ?fields=id,username,profile_picture_url,followers_count
    // &access_token={page-access-token}

    this.logger.debug(`Getting Instagram account details (stubbed) - id: ${igAccountId}`);

    throw new BadRequestException(
      'Meta API integration not implemented. Implement getInstagramAccountDetails() with actual HTTP calls.',
    );
  }

  // ==========================================================================
  // Token Encryption (Stubbed - Implement with proper encryption)
  // ==========================================================================

  /**
   * Encrypts an access token for storage.
   * TODO: Implement with AES-256-GCM or similar.
   */
  private encryptToken(token: string): string {
    // TODO: Implement proper encryption
    // For now, just return the token (NOT SAFE FOR PRODUCTION)
    this.logger.warn('Token encryption not implemented - storing token in plaintext');
    return token;
  }

  /**
   * Decrypts an access token for use.
   */
  decryptToken(encryptedToken: string): string {
    // TODO: Implement proper decryption
    return encryptedToken;
  }
}

