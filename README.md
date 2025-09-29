# Turbo Task Management Tool

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A modern task management system built with NX monorepo architecture, featuring secure role-based access control (RBAC) and task management capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Setup Instructions

#### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd turbo-task-mgt
npm install
```

#### 2. Database Setup
```bash
# Create PostgreSQL database
createdb turbo_task_mgt_db

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

#### 3. Start the Applications
```bash
# Terminal 1: Start the backend API
npx nx serve api

# Terminal 2: Start the frontend dashboard
npx nx serve dashboard
```

#### 4. Access the Applications
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3003/api
- **API Documentation**: http://localhost:3003/api/docs (Swagger is enabled)
- **API Req Postman collectiom**: [Link](https://github.com/mspatell/turbo-task-mgt/blob/main/TurboVets-API-Postman-Collection.json)

#### 5. Demo Credentials
The application includes seeded demo users:
- **Owner**: `owner@turbovets.com` / `password123`
- **Admin**: `admin@turbovets.com` / `password123`
- **Viewer 1**: `vet1@turbovets.com` / `password123`
- **Viewer 2**: `vet2@turbovets.com` / `password123`

## 🏗️ Architecture Overview

This project implements a modern monorepo architecture using Nx, with clear separation of concerns and shared libraries for maximum code reuse and maintainability.

### Monorepo Structure

```
turboVets/
├── apps/
│   ├── api/           → NestJS backend API server
│   ├── dashboard/     → Angular frontend application
│   ├── api-e2e/       → End-to-end tests for API
│   └── dashboard-e2e/ → End-to-end tests for dashboard
├── libs/
│   ├── data/          → Shared TypeScript interfaces & DTOs
│   └── auth/          → Reusable RBAC logic and decorators
└── tools/             → Build and development utilities
```

### Technology Stack

#### Backend (NestJS API)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens with passport.js
- **Authorization**: Custom RBAC implementation
- **Features**: RESTful API, audit logging, organization scoping

#### Frontend (Angular Dashboard)
- **Framework**: Angular 20 with TypeScript
- **State Management**: NgRx for complex state management
- **UI Components**: Angular Material (if used) or custom components
- **Routing**: Angular Router with guards
- **HTTP Client**: Angular HttpClient with interceptors

#### Shared Libraries
- **Data Library**: TypeScript interfaces, DTOs, and data structures
- **Auth Library**: Reusable authentication decorators, guards, and utilities

### Key Architectural Decisions

1. **Monorepo Structure**: Enables code sharing, consistent tooling, and coordinated development
2. **Shared Libraries**: Reduces duplication and ensures type safety across frontend/backend
3. **Organization-Scoped RBAC**: Multi-tenant architecture with hierarchical access control
4. **JWT Authentication**: Stateless authentication suitable for distributed systems
5. **Audit Logging**: Comprehensive tracking of user actions for compliance

## � Sample API Requests/Responses

### Authentication

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@turbovets.com",
  "password": "password123"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@turbovets.com",
    "firstName": "Jane",
    "lastName": "Admin",
    "role": "admin",
    "organizationId": "org-uuid"
  }
}
```

### Tasks Management

#### Get Tasks (Organization Scoped)
```bash
GET /api/tasks
Authorization: Bearer <token>

# Response
{
  "data": [
    {
      "id": "task-uuid",
      "title": "Update inventory system",
      "description": "Implement new inventory tracking",
      "status": "todo",
      "priority": "high",
      "category": "system",
      "dueDate": "2025-08-15T00:00:00.000Z",
      "createdBy": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Owner"
      },
      "assignedTo": {
        "id": "user-uuid",
        "firstName": "Jane",
        "lastName": "Admin"
      },
      "organizationId": "org-uuid",
      "createdAt": "2025-08-08T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Create Task
```bash
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Equipment maintenance",
  "description": "Monthly maintenance check for lab equipment",
  "priority": "medium",
  "category": "maintenance",
  "assignedToId": "user-uuid",
  "dueDate": "2025-08-20T00:00:00.000Z"
}

# Response
{
  "id": "new-task-uuid",
  "title": "Equipment maintenance",
  "description": "Monthly maintenance check for lab equipment",
  "status": "todo",
  "priority": "medium",
  "category": "maintenance",
  "createdById": "current-user-uuid",
  "assignedToId": "user-uuid",
  "organizationId": "org-uuid",
  "createdAt": "2025-08-08T14:00:00.000Z"
}
```

### User Management

#### Get Users (Admin/Owner only)
```bash
GET /api/users
Authorization: Bearer <token>

# Response
{
  "data": [
    {
      "id": "user-uuid",
      "email": "vet1@turbovets.com",
      "firstName": "Dr. Alice",
      "lastName": "Veterinarian",
      "role": "viewer",
      "organizationId": "org-uuid",
      "isActive": true,
      "createdAt": "2025-08-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Organizations

#### Get Organizations (Owner only)
```bash
GET /api/organizations
Authorization: Bearer <token>

# Response
{
  "data": [
    {
      "id": "org-uuid",
      "name": "Downtown Office",
      "description": "Downtown veterinary clinic",
      "parentId": "parent-org-uuid",
      "isActive": true,
      "createdAt": "2025-08-01T00:00:00.000Z"
    }
  ]
}
```

### Audit Logs

#### Get Audit Logs
```bash
GET /api/audit?action=task_created&startDate=2025-08-01
Authorization: Bearer <token>

# Response
{
  "data": [
    {
      "id": "audit-uuid",
      "action": "task_created",
      "entityType": "task",
      "entityId": "task-uuid",
      "userId": "user-uuid",
      "organizationId": "org-uuid",
      "newValues": {
        "title": "Equipment maintenance",
        "priority": "medium"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-08-08T14:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Error Responses

#### Unauthorized Access
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Forbidden Access
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

#### Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "priority must be one of: low, medium, high, critical"
  ],
  "error": "Bad Request"
}
```

## 🚀 Applications

### API (NestJS Backend)
- **Location**: `apps/api/`
- **Technology**: NestJS, TypeORM, JWT Authentication
- **Database**: PostgreSQL
- **Features**: User management, Organizations, Tasks, Audit logging

### Dashboard (Angular Frontend)
- **Location**: `apps/dashboard/`
- **Technology**: Angular 20, TypeScript
- **Features**: Modern responsive UI for veterinary management

## 📚 Shared Libraries

### Data Library (`@turbo-vets/data`)
- **Location**: `libs/data/`
- **Purpose**: Shared TypeScript interfaces, DTOs, and data structures
- **Exports**: Entity interfaces, API DTOs, Authentication DTOs

### Auth Library (`@turbo-vets/auth`)
- **Location**: `libs/auth/`
- **Purpose**: Reusable authentication and authorization logic
- **Features**: 
  - Role-based access control (RBAC)
  - Custom decorators (@Roles, @CurrentUser, @Public, @OrganizationScoped)
  - Auth guards and utilities
  - Role hierarchy management

## 🔐 Access Control Design & Data Models

### Role-Based Access Control (RBAC)

The system implements a hierarchical three-tier role system with organization scoping:

#### Role Hierarchy
1. **Owner** (Highest Level)
   - Full system access across all organizations
   - Can create, modify, and delete organizations
   - Can manage all users including other owners
   - Can assign/revoke any role

2. **Admin** (Organization Level)
   - Full access within assigned organization(s)
   - Can manage users (except owners) in their organization
   - Can create, update, and delete tasks
   - Can view audit logs for their organization

3. **Viewer** (Limited Access)
   - Read-only access to assigned resources
   - Can view tasks assigned to them or in their organization
   - Can update status of assigned tasks
   - Cannot create or delete resources

#### Organization Scoping
- Users belong to specific organizations
- Data access is automatically scoped to user's organization
- Hierarchical organizations supported (parent/child relationships)
- Cross-organization access requires special permissions

### Data Models

#### User Entity
```typescript
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Organization Entity
```typescript
interface Organization {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Task Entity
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  createdById: string;
  assignedToId?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Audit Entity
```typescript
interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  organizationId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

### Access Control Implementation

#### Custom Decorators
- `@Roles(role1, role2)`: Restricts access to specific roles
- `@OrganizationScoped()`: Automatically filters data by user's organization
- `@CurrentUser()`: Injects authenticated user into controller methods
- `@Public()`: Bypasses authentication for public endpoints

#### Guards and Middleware
- `JwtAuthGuard`: Validates JWT tokens and extracts user information
- `RolesGuard`: Enforces role-based access restrictions
- `OrganizationScopeGuard`: Ensures data access is limited to user's organization

## 🛠️ Development Commands

### Running Applications
```bash
# Start backend API (http://localhost:3003)
npx nx serve api

# Start frontend dashboard (http://localhost:4200)
npx nx serve dashboard

# Start both in watch mode
npm run dev
```

### Building for Production
```bash
# Build all applications
npx nx run-many -t build -p dashboard,api

# Build specific application
npx nx build api
npx nx build dashboard
```

### Testing
```bash
# Run all tests
npx nx run-many -t test

# Run specific tests
npx nx test api
npx nx test auth
npx nx e2e api-e2e

# Test with coverage
npx nx test api --coverage
```

### Code Quality
```bash
# Lint all projects
npx nx run-many -t lint

# Format code
npx nx format

# Type checking
npx nx run-many -t type-check
```

## 📦 Using Shared Libraries

### Data Library (`@turbo-vets/data`)
```typescript
import { 
  UserRole, 
  CreateUserDto, 
  LoginDto,
  IUser,
  TaskStatus,
  TaskPriority 
} from '@turbo-vets/data';
```

### Auth Library (`@turbo-vets/auth`)
```typescript
import { 
  Roles, 
  CurrentUser, 
  Public,
  OrganizationScoped,
  RolesGuard 
} from '@turbo-vets/auth';

// Example NestJS controller
@Controller('tasks')
@UseGuards(RolesGuard)
export class TasksController {
  @Get()
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  @OrganizationScoped()
  findAll(@CurrentUser() user: AuthUser) {
    return this.tasksService.findAll(user.organizationId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: AuthUser) {
    return this.tasksService.create(createTaskDto, user);
  }
}
```

## 🗂️ Project Structure Details

### API Structure
```
apps/api/src/
├── app/           → Main application module & configuration
├── auth/          → Authentication strategies, guards, JWT logic
├── entities/      → TypeORM database entities (User, Task, Organization, Audit)
├── tasks/         → Task management controllers and services
├── organizations/ → Organization management
├── audit/         → Audit logging functionality
├── services/      → Shared business logic and utilities
└── seeders/       → Database seeders for demo data
```

### Dashboard Structure
```
apps/dashboard/src/app/
├── core/          → Core services, guards, interceptors
├── shared/        → Shared components, pipes, directives
├── features/      → Feature modules (tasks, users, dashboard)
├── auth/          → Authentication components and services
└── store/         → NgRx state management (actions, reducers, effects)
```

### Library Structure
```
libs/
├── data/src/
│   ├── dtos/      → Data transfer objects
│   └── interfaces/→ TypeScript interfaces
└── auth/src/
    ├── decorators/→ Custom decorators (@Roles, @CurrentUser, etc.)
    ├── guards/    → Authentication and authorization guards
    ├── types/     → Auth-related TypeScript types
    └── utils/     → Authentication utilities
```

## 🎯 Key Features Demonstrated

### Security Features
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Organization-scoped data access
- ✅ Password hashing with bcrypt
- ✅ Comprehensive audit logging
- ✅ Request validation and sanitization

### Architecture Features
- ✅ Monorepo structure with Nx
- ✅ Shared libraries for code reuse
- ✅ TypeScript throughout the stack
- ✅ RESTful API design
- ✅ Responsive Angular frontend
- ✅ State management with NgRx 

### Development Features
- ✅ Comprehensive test coverage
- ✅ ESLint and Prettier configuration
- ✅ Development and production builds
- ✅ Database migrations and seeders
- ✅ API documentation


