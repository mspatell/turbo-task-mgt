# Auth Library (`@turbo-vets/auth`)

Reusable authentication and authorization utilities for the TurboVets application.

## Overview

This library provides a comprehensive Role-Based Access Control (RBAC) system with decorators, guards, and utility functions for NestJS applications. It implements a three-tier role hierarchy and organization-scoped access control.

## Installation

```typescript
// Import what you need
import { 
  Roles, 
  CurrentUser, 
  Public,
  OrganizationScoped,
  RolesGuard,
  OrganizationScopedGuard,
  AuthUtils,
  UserRole,
  AuthUser 
} from '@turbo-vets/auth';
```

## Role Hierarchy

The system implements three permission levels:

1. **VIEWER** (Level 1) - Read-only access to assigned resources
2. **ADMIN** (Level 2) - Can manage viewers and organization resources  
3. **OWNER** (Level 3) - Full system access, can manage organizations and all users

## Decorators

### `@Roles(...roles: UserRole[])`

Specifies required roles for accessing an endpoint.

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, UserRole } from '@turbo-vets/auth';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getUsers() {
    // Only admins and owners can access
  }

  @Get('settings')  
  @Roles(UserRole.OWNER)
  getSettings() {
    // Only owners can access
  }
}
```

### `@CurrentUser()`

Injects the authenticated user into a route handler parameter.

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, AuthUser } from '@turbo-vets/auth';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: AuthUser) {
    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }
}
```

### `@Public()`

Marks an endpoint as publicly accessible (no authentication required).

```typescript
import { Controller, Post } from '@nestjs/common';
import { Public } from '@turbo-vets/auth';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()
  login(@Body() loginDto: LoginDto) {
    // Public endpoint - no auth required
  }
}
```

### `@OrganizationScoped()`

Ensures users can only access resources within their organization.

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { 
  OrganizationScoped, 
  OrganizationScopedGuard, 
  CurrentUser, 
  AuthUser 
} from '@turbo-vets/auth';

@Controller('tasks')
@UseGuards(OrganizationScopedGuard)
export class TasksController {
  @Get()
  @OrganizationScoped()
  getTasks(@CurrentUser() user: AuthUser) {
    // User can only see tasks from their organization
    // user.organizationId is automatically validated
  }
}
```

## Guards

### `RolesGuard`

Enforces role-based access control based on `@Roles()` decorator.

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@turbo-vets/auth';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

### `OrganizationScopedGuard`

Enforces organization-level access control based on `@OrganizationScoped()` decorator.

```typescript
@Controller('api')
@UseGuards(JwtAuthGuard, OrganizationScopedGuard)
export class ApiController {
  // All endpoints will be organization-scoped
}
```

## Utilities

### `AuthUtils`

Comprehensive utility class for common authorization operations.

```typescript
import { AuthUtils, UserRole } from '@turbo-vets/auth';

// Role management
const canManage = AuthUtils.canManageUser(UserRole.ADMIN, UserRole.VIEWER); // true
const canView = AuthUtils.canViewUser(UserRole.ADMIN, UserRole.OWNER); // false

// Role assignment
const maxRole = AuthUtils.getMaxAssignableRole(UserRole.ADMIN); // UserRole.VIEWER
const canAssign = AuthUtils.canAssignRole(UserRole.OWNER, UserRole.ADMIN); // true

// Permission checks
const isAdmin = AuthUtils.isAdmin(UserRole.ADMIN); // true
const isOwner = AuthUtils.isOwner(UserRole.VIEWER); // false
const canManageOrg = AuthUtils.canManageOrganization(UserRole.OWNER); // true

// Request utilities
const clientIp = AuthUtils.getClientIp(request);
const userAgent = AuthUtils.getUserAgent(request);

// Permission generation
const permissions = AuthUtils.generatePermissions(UserRole.ADMIN, 'org-123');
// Returns: ['auth:read-profile', 'auth:update-profile', 'users:read', ...]
```

### `RoleHierarchy`

Static utility class for role hierarchy operations.

```typescript
import { RoleHierarchy, UserRole } from '@turbo-vets/auth';

// Permission checks
const hasPermission = RoleHierarchy.hasPermission(
  UserRole.ADMIN, 
  UserRole.VIEWER
); // true

const hasHigher = RoleHierarchy.hasHigherPermission(
  UserRole.OWNER, 
  UserRole.ADMIN
); // true

// Get manageable roles
const manageableRoles = RoleHierarchy.getRolesWithLowerOrEqualPermissions(
  UserRole.ADMIN
); // [UserRole.VIEWER, UserRole.ADMIN]
```

## Types

### `AuthUser`

Represents an authenticated user in the system.

```typescript
interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
}
```

### `JwtPayload`

JWT token payload structure.

```typescript
interface JwtPayload {
  sub: string;           // User ID
  email: string;
  role: UserRole;
  organizationId?: string;
  iat?: number;          // Issued at
  exp?: number;          // Expires at
}
```

### `AuthContext`

Authentication context for request processing.

```typescript
interface AuthContext {
  user: AuthUser;
  permissions: string[];
  organizationId?: string;
}
```

## Complete Example

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@turbo-vets/auth';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

// users.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { 
  Roles, 
  CurrentUser, 
  OrganizationScoped,
  OrganizationScopedGuard,
  UserRole, 
  AuthUser 
} from '@turbo-vets/auth';
import { CreateUserDto, UpdateUserDto } from '@turbo-vets/data';

@Controller('users')
@UseGuards(OrganizationScopedGuard)
export class UsersController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @OrganizationScoped()
  findAll(@CurrentUser() currentUser: AuthUser) {
    // Only admins/owners can list users in their organization
  }

  @Post()
  @Roles(UserRole.OWNER)
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthUser
  ) {
    // Only owners can create users
    // New user will be added to currentUser's organization
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @OrganizationScoped()
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthUser
  ) {
    // Admins/owners can update users in their organization
    // Additional business logic can check if admin is trying to 
    // update an owner (which should be prevented)
  }
}
```

## Development

### Building

```bash
npx nx build auth
```

### Testing

```bash
npx nx test auth
```

### Linting

```bash
npx nx lint auth
```

## Best Practices

1. **Always use guards**: Apply `RolesGuard` globally or per controller
2. **Combine decorators**: Use `@Roles()` with `@OrganizationScoped()` for fine-grained control
3. **Validate business logic**: Use `AuthUtils` methods for additional permission checks
4. **Audit access**: Consider logging access attempts using `AuthUtils.getClientIp()` and `AuthUtils.getUserAgent()`
5. **Handle edge cases**: Check for organization membership before allowing organization-scoped operations

## Integration Notes

- This library is designed to work with NestJS and requires the `@nestjs/common` package
- User authentication (JWT validation) should be handled by a separate guard before these authorization guards
- The `AuthUser` type should match your authentication system's user object structure
