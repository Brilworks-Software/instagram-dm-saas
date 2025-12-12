import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorator to extract the current workspace ID from the request.
 * Works with AuthGuard which attaches workspaceId to request.
 */
export const CurrentWorkspace = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any).workspaceId;
  },
);

