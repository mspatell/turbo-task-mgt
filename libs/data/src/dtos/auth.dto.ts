// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId?: string;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
