import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { InstagramService } from './instagram.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';

// ============================================================================
// DTOs
// ============================================================================

interface OAuthCallbackQuery {
  code?: string;
  state?: string;
  error?: string;
  error_reason?: string;
  error_description?: string;
}

interface WebhookVerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
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
    quick_reply?: { payload: string };
    is_deleted?: boolean;
    reply_to?: { mid: string };
  };
  read?: { watermark: number };
  delivery?: { mids: string[]; watermark: number };
}

interface WebhookChangeEvent {
  field: string;
  value: unknown;
}

interface StartOAuthResponse {
  authUrl: string;
}

// ============================================================================
// Controller
// ============================================================================

@Controller('instagram')
export class InstagramController {
  private readonly logger = new Logger(InstagramController.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initiates the Meta OAuth flow for connecting an Instagram Business account.
   * Returns the authorization URL to redirect the user to.
   * 
   * POST endpoint for frontend to start OAuth - returns { url: string }
   */
  @Post('oauth/start')
  async startOAuthPost(): Promise<{ url: string }> {
    // For demo purposes, use a default workspace and user
    // In production, this should be protected and use actual user context
    const workspaceId = '11111111-1111-1111-1111-111111111111';
    const userId = '22222222-2222-2222-2222-222222222222';
    
    this.logger.log(`Starting OAuth flow for workspace ${workspaceId}`);

    const authUrl = await this.instagramService.startOAuth(workspaceId, userId);

    return { url: authUrl };
  }

  /**
   * GET endpoint for OAuth start (redirects directly)
   */
  @Get('oauth/start')
  async startOAuthGet(@Res() res: Response): Promise<void> {
    const workspaceId = '11111111-1111-1111-1111-111111111111';
    const userId = '22222222-2222-2222-2222-222222222222';
    
    this.logger.log(`Starting OAuth flow (GET) for workspace ${workspaceId}`);

    const authUrl = await this.instagramService.startOAuth(workspaceId, userId);
    
    res.redirect(authUrl);
  }

  /**
   * Handles the OAuth callback from Meta.
   * Exchanges the authorization code for access tokens and stores the Instagram account.
   */
  @Get('oauth/callback')
  async handleOAuthCallback(
    @Query() query: OAuthCallbackQuery,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // Handle OAuth errors
    if (query.error) {
      this.logger.error(
        `OAuth error: ${query.error} - ${query.error_reason}: ${query.error_description}`,
      );
      res.redirect(`${frontendUrl}/settings/instagram?error=${encodeURIComponent(query.error)}`);
      return;
    }

    // Validate required parameters
    if (!query.code || !query.state) {
      this.logger.error('Missing code or state in OAuth callback');
      res.redirect(`${frontendUrl}/settings/instagram?error=missing_params`);
      return;
    }

    try {
      const result = await this.instagramService.handleOAuthCallback(query.code, query.state);

      this.logger.log(`Successfully connected Instagram account: ${result.igUsername}`);

      res.redirect(
        `${frontendUrl}/settings/instagram?success=true&account=${encodeURIComponent(result.igUsername)}`,
      );
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${(error as Error).message}`, (error as Error).stack);
      res.redirect(`${frontendUrl}/settings/instagram?error=callback_failed`);
    }
  }

  /**
   * Webhook verification endpoint for Meta.
   * Meta sends a GET request to verify the webhook subscription.
   */
  @Get('webhook')
  verifyWebhook(@Query() query: WebhookVerifyQuery): string {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const verifyToken = this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verified successfully');
      return challenge || '';
    }

    this.logger.warn('Webhook verification failed');
    return 'Verification failed';
  }

  /**
   * Receives incoming webhook events from Meta.
   * Processes Instagram DM events, message reads, deliveries, etc.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(@Body() payload: WebhookPayload): Promise<string> {
    // Always respond quickly to Meta to avoid retries
    // Process in background via queue for production

    this.logger.debug(`Received webhook: ${JSON.stringify(payload)}`);

    if (payload.object !== 'instagram') {
      this.logger.warn(`Ignoring non-Instagram webhook: ${payload.object}`);
      return 'EVENT_RECEIVED';
    }

    try {
      await this.instagramService.receiveWebhook(payload);
    } catch (error) {
      // Log but don't throw - we need to return 200 to Meta
      this.logger.error(`Error processing webhook: ${(error as Error).message}`, (error as Error).stack);
    }

    return 'EVENT_RECEIVED';
  }

  /**
   * Lists connected Instagram accounts for the current workspace.
   */
  @Get('accounts')
  @UseGuards(AuthGuard)
  async listAccounts(@CurrentWorkspace() workspaceId: string) {
    return this.instagramService.listAccounts(workspaceId);
  }

  /**
   * Disconnects an Instagram account.
   */
  @Post('accounts/:accountId/disconnect')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async disconnectAccount(
    @CurrentWorkspace() workspaceId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.instagramService.disconnectAccount(workspaceId, accountId);
  }
}

