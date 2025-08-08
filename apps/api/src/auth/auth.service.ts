import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { AuditService } from '../services/audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';
import { JwtPayload } from './jwt.strategy';
import { UserRole } from '@turbo-vets/auth';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  role?: UserRole;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['organization'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User, request: any) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    const token = this.jwtService.sign(payload);

    // Log successful login
    await this.auditService.log({
      action: AuditAction.LOGIN,
      resource: AuditResource.AUTH,
      userId: user.id,
      organizationId: user.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `User ${user.email} logged in successfully`,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  async register(registerDto: RegisterDto, request: any) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Log user registration
    await this.auditService.log({
      action: AuditAction.CREATE,
      resource: AuditResource.USER,
      resourceId: savedUser.id,
      userId: savedUser.id,
      organizationId: savedUser.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `User ${savedUser.email} registered successfully`,
    });

    // Return login response
    return this.login(savedUser, request);
  }

  async logout(user: User, request: any) {
    // Log logout
    await this.auditService.log({
      action: AuditAction.LOGOUT,
      resource: AuditResource.AUTH,
      userId: user.id,
      organizationId: user.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `User ${user.email} logged out`,
    });

    return { message: 'Logged out successfully' };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto, request: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('Email already exists');
      }
    }

    // Update user properties
    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);

    // Log the profile update
    await this.auditService.log({
      action: AuditAction.UPDATE,
      resource: AuditResource.USER,
      userId: user.id,
      organizationId: user.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `User profile updated: ${Object.keys(updateData).join(', ')}`,
    });

    // Return user without password
    const { password, ...result } = updatedUser;
    return result;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      '127.0.0.1'
    );
  }
}
