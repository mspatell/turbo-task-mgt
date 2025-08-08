export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // Changed to string to avoid conflict
  isActive: boolean;
  organizationId?: string;
  organization?: IOrganization;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  organizationId?: string;
}

export interface IUpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  organizationId?: string;
}

export interface IOrganization {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  parent?: IOrganization;
  children?: IOrganization[];
  users?: IUser[];
  tasks?: ITask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrganization {
  name: string;
  description?: string;
  parentId?: string;
}

export interface IUpdateOrganization {
  name?: string;
  description?: string;
  isActive?: boolean;
  parentId?: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedToId?: string;
  assignedTo?: IUser;
  organizationId?: string;
  organization?: IOrganization;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  assignedToId?: string;
  organizationId?: string;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
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

export interface IAuditLog {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  userId?: string;
  user?: IUser;
  organizationId?: string;
  organization?: IOrganization;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
