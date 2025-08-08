import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}

/**
 * Role hierarchy utility functions
 */
export class RoleHierarchy {
  private static readonly hierarchy: Record<UserRole, number> = {
    [UserRole.VIEWER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.OWNER]: 3,
  };

  /**
   * Check if a user role has sufficient permissions (equal or higher level)
   */
  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.hierarchy[userRole] >= this.hierarchy[requiredRole];
  }

  /**
   * Check if a user role has higher permissions than another role
   */
  static hasHigherPermission(userRole: UserRole, compareRole: UserRole): boolean {
    return this.hierarchy[userRole] > this.hierarchy[compareRole];
  }

  /**
   * Get all roles that have equal or lower permissions
   */
  static getRolesWithLowerOrEqualPermissions(userRole: UserRole): UserRole[] {
    const userLevel = this.hierarchy[userRole];
    return Object.entries(this.hierarchy)
      .filter(([, level]) => level <= userLevel)
      .map(([role]) => role as UserRole);
  }
}
