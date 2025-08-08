import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types';

/**
 * Decorator to inject the current authenticated user into a route handler
 * @example
 * @Get('/profile')
 * getProfile(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
