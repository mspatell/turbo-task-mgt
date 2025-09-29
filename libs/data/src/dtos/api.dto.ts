import { UserRole, TaskStatus, TaskPriority, TaskCategory } from '../enums';

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  organizationId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Organization DTOs
export interface CreateOrganizationDto {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  parentId?: string;
}

export interface OrganizationResponseDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task DTOs
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
  organizationId?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common DTOs
export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponseDto<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Query DTOs
export interface UserQueryDto extends PaginationDto {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId?: string;
}

export interface TaskQueryDto extends PaginationDto {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assignedToId?: string;
  organizationId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface OrganizationQueryDto extends PaginationDto {
  search?: string;
  isActive?: boolean;
  parentId?: string;
}

// Audit DTOs
export interface AuditLogQuery extends PaginationDto {
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  offset?: number;
}

export interface AuditLogsResponse extends PaginatedResponseDto<AuditLogDto> {}

export interface AuditLogDto {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  organizationId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  resource: string;
  createdAt: Date;
  details?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
