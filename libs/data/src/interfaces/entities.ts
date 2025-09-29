import { UserRole, TaskStatus, TaskPriority, TaskCategory } from '../enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  organizationId?: string;
  organization?: Organization;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  organizationId?: string;
}

export interface UpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  parent?: Organization;
  children?: Organization[];
  users?: User[];
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganization {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateOrganization {
  name?: string;
  description?: string;
  isActive?: boolean;
  parentId?: string;
}



export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
  assignedTo?: User;
  organizationId?: string;
  organization?: Organization;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
  organizationId?: string;
}

export interface UpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: Date;
  assignedToId?: string;
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum AuditResource {
  USER = 'user',
  ORGANIZATION = 'organization',
  TASK = 'task',
  AUTH = 'auth',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  userId?: string;
  user?: User;
  organizationId?: string;
  organization?: Organization;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
