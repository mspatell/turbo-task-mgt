# Data Library (`@turbo-vets/data`)

Shared TypeScript interfaces, DTOs, and data structures for the TurboVets application.

## Overview

This library provides type-safe data contracts shared between the frontend and backend applications. It includes entity interfaces, API DTOs, and authentication-related data structures.

## Installation

```typescript
// Import what you need
import { 
  UserRole, 
  CreateUserDto, 
  LoginDto,
  IUser,
  TaskStatus,
  TaskPriority 
} from '@turbo-vets/data';
```

## Exports

### Enums

- `UserRole` - User permission levels (OWNER, ADMIN, VIEWER)
- `TaskStatus` - Task completion states (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `TaskPriority` - Task importance levels (LOW, MEDIUM, HIGH, CRITICAL)
- `AuditAction` - Audit log action types
- `AuditResource` - Audit log resource types

### Entity Interfaces

- `IUser` - User entity interface
- `IOrganization` - Organization entity interface
- `ITask` - Task entity interface
- `IAuditLog` - Audit log interface
- `ICreateUser`, `IUpdateUser` - User CRUD interfaces
- `ICreateOrganization`, `IUpdateOrganization` - Organization CRUD interfaces
- `ICreateTask`, `IUpdateTask` - Task CRUD interfaces

### API DTOs

#### User DTOs
- `CreateUserDto` - User creation payload
- `UpdateUserDto` - User update payload
- `UserResponseDto` - User response data
- `UserQueryDto` - User query parameters

#### Organization DTOs
- `CreateOrganizationDto` - Organization creation payload
- `UpdateOrganizationDto` - Organization update payload
- `OrganizationResponseDto` - Organization response data
- `OrganizationQueryDto` - Organization query parameters

#### Task DTOs
- `CreateTaskDto` - Task creation payload
- `UpdateTaskDto` - Task update payload
- `TaskResponseDto` - Task response data
- `TaskQueryDto` - Task query parameters

#### Common DTOs
- `PaginationDto` - Pagination parameters
- `PaginatedResponseDto<T>` - Paginated response wrapper
- `ApiResponseDto<T>` - Standardized API response

### Authentication DTOs

- `LoginDto` - Login request payload
- `LoginResponseDto` - Login response with token
- `RegisterDto` - User registration payload
- `ChangePasswordDto` - Password change payload
- `ForgotPasswordDto` - Password reset request
- `ResetPasswordDto` - Password reset payload

## Usage Examples

### Frontend (Angular)

```typescript
import { Component } from '@angular/core';
import { CreateUserDto, UserRole } from '@turbo-vets/data';

@Component({...})
export class CreateUserComponent {
  createUser(userData: CreateUserDto) {
    const newUser: CreateUserDto = {
      email: 'user@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.VIEWER,
      organizationId: 'org-123'
    };
    
    // Send to API
    this.userService.create(newUser).subscribe(response => {
      console.log('User created:', response);
    });
  }
}
```

### Backend (NestJS)

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto, UserResponseDto } from '@turbo-vets/data';

@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }
}
```

### Type Guards

```typescript
import { UserRole } from '@turbo-vets/data';

function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.OWNER;
}

function canManageUsers(role: UserRole): boolean {
  return role === UserRole.OWNER;
}
```

## Development

### Building

```bash
npx nx build data
```

### Testing

```bash
npx nx test data
```

### Linting

```bash
npx nx lint data
```

## Notes

- All interfaces use consistent naming: `I` prefix for entity interfaces
- DTOs follow the pattern: `{Action}{Entity}Dto`
- Response DTOs include all necessary data for frontend consumption
- Query DTOs extend `PaginationDto` for consistent pagination
- Enums use string values for better debugging and API transparency
