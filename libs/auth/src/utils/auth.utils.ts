import { UserRole } from '@turbo-vets/data';

/**
 * Utility functions for authentication and authorization
 */
export class AuthUtils {
  /**
   * Check if a user can manage another user based on role hierarchy
   */
  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.VIEWER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.OWNER]: 3,
    };

    return hierarchy[managerRole] > hierarchy[targetRole];
  }

  /**
   * Check if a user can view another user's data based on role hierarchy
   */
  static canViewUser(viewerRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.VIEWER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.OWNER]: 3,
    };

    return hierarchy[viewerRole] >= hierarchy[targetRole];
  }

  /**
   * Get maximum role a user can assign to others
   */
  static getMaxAssignableRole(userRole: UserRole): UserRole {
    switch (userRole) {
      case UserRole.OWNER:
        return UserRole.ADMIN; // Owners can assign up to Admin
      case UserRole.ADMIN:
        return UserRole.VIEWER; // Admins can assign up to Viewer
      case UserRole.VIEWER:
      default:
        return UserRole.VIEWER; // Viewers can only assign Viewer (if they can assign at all)
    }
  }

  /**
   * Check if a user can assign a specific role
   */
  static canAssignRole(assignerRole: UserRole, roleToAssign: UserRole): boolean {
    const maxAssignable = this.getMaxAssignableRole(assignerRole);
    const hierarchy: Record<UserRole, number> = {
      [UserRole.VIEWER]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.OWNER]: 3,
    };

    return hierarchy[roleToAssign] <= hierarchy[maxAssignable];
  }

  /**
   * Get all roles that a user can manage (assign, modify, delete)
   */
  static getManageableRoles(userRole: UserRole): UserRole[] {
    switch (userRole) {
      case UserRole.OWNER:
        return [UserRole.ADMIN, UserRole.VIEWER];
      case UserRole.ADMIN:
        return [UserRole.VIEWER];
      case UserRole.VIEWER:
      default:
        return [];
    }
  }

  /**
   * Get all roles that a user can view
   */
  static getViewableRoles(userRole: UserRole): UserRole[] {
    switch (userRole) {
      case UserRole.OWNER:
        return [UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER];
      case UserRole.ADMIN:
        return [UserRole.ADMIN, UserRole.VIEWER];
      case UserRole.VIEWER:
      default:
        return [UserRole.VIEWER];
    }
  }

  /**
   * Check if a user has administrative privileges
   */
  static isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.OWNER;
  }

  /**
   * Check if a user is an owner
   */
  static isOwner(role: UserRole): boolean {
    return role === UserRole.OWNER;
  }

  /**
   * Check if a user can perform organization-level operations
   */
  static canManageOrganization(role: UserRole): boolean {
    return role === UserRole.OWNER;
  }

  /**
   * Extract client IP from request
   */
  static getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Extract user agent from request
   */
  static getUserAgent(request: any): string {
    return request.headers['user-agent'] || 'unknown';
  }

  /**
   * Generate a simple permission string for a user
   */
  static generatePermissions(role: UserRole, organizationId?: string): string[] {
    const permissions: string[] = [];

    // Base permissions for all users
    permissions.push('auth:read-profile', 'auth:update-profile');

    switch (role) {
      case UserRole.OWNER:
        permissions.push(
          'organization:*',
          'users:*',
          'tasks:*',
          'audit:read'
        );
        break;
      case UserRole.ADMIN:
        permissions.push(
          'users:read',
          'users:create',
          'users:update-viewer',
          'tasks:*',
          'organization:read'
        );
        break;
      case UserRole.VIEWER:
        permissions.push(
          'tasks:read',
          'tasks:update-own',
          'organization:read',
          'users:read-basic'
        );
        break;
    }

    // Add organization-specific permissions if applicable
    if (organizationId) {
      permissions.push(`organization:${organizationId}:member`);
    }

    return permissions;
  }
}
