import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing an endpoint
 * @param roles - Array of UserRole values required to access the endpoint
 * @example
 * @Roles(UserRole.ADMIN, UserRole.OWNER)
 * @Get('/admin-only')
 * adminEndpoint() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
