import { UserRole } from '@turbo-vets/data';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}

export interface AuthContext {
  user: AuthUser;
  permissions: string[];
  organizationId?: string;
}
