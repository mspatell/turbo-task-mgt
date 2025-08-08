import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORGANIZATION_SCOPED_KEY } from '../decorators/organization-scoped.decorator';
import { AuthUser } from '../types';

@Injectable()
export class OrganizationScopedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isOrganizationScoped = this.reflector.getAllAndOverride<boolean>(
      ORGANIZATION_SCOPED_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!isOrganizationScoped) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      return false;
    }

    // If user doesn't have an organization, deny access
    if (!user.organizationId) {
      throw new ForbiddenException('User must be associated with an organization to access this resource');
    }

    // Add organizationId to request for use in controllers/services
    request.organizationId = user.organizationId;

    return true;
  }
}
