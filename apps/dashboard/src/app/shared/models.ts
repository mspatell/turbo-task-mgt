export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  organization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  organizationId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  role?: UserRole;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  SHOPPING = 'shopping',
  OTHER = 'other'
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: Date;
  organizationId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

// Audit Log Interfaces
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS_DENIED = 'access_denied',
}

export enum AuditResource {
  TASK = 'task',
  USER = 'user',
  ORGANIZATION = 'organization',
  AUTH = 'auth',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  userId?: string;
  organizationId?: string;
  user?: User;
  createdAt: Date;
}

export interface AuditLogQuery {
  userId?: string;
  organizationId?: string;
  resource?: AuditResource;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[];
  total: number;
}

export interface AuditSummary {
  totalLogs: number;
  recentActivity: AuditLog[];
  accessibleOrganizations: number;
}
