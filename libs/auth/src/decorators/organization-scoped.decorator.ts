import { SetMetadata } from '@nestjs/common';

export const ORGANIZATION_SCOPED_KEY = 'organizationScoped';

/**
 * Decorator to mark an endpoint as organization-scoped
 * This means the user can only access resources within their organization
 * @example
 * @OrganizationScoped()
 * @Get('/tasks')
 * getTasks(@CurrentUser() user: AuthUser) { ... }
 */
export const OrganizationScoped = () => SetMetadata(ORGANIZATION_SCOPED_KEY, true);
