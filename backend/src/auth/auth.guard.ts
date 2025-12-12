import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Auth guard stub - implement actual JWT/session validation.
 * For now, expects x-user-id and x-workspace-id headers for development.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // TODO: Implement actual JWT validation
    // For development, accept headers
    const userId = request.headers['x-user-id'] as string;
    const workspaceId = request.headers['x-workspace-id'] as string;

    if (!userId || !workspaceId) {
      throw new UnauthorizedException('Authentication required');
    }

    // Attach to request for decorators
    (request as any).userId = userId;
    (request as any).workspaceId = workspaceId;

    return true;
  }
}

