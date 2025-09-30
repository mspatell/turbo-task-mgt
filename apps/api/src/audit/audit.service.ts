import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResource } from '../entities/audit-log.entity';

export interface AuditLogData {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  userId?: string;
  organizationId?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    try {
      const auditLog = AuditLog.create(data);
      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Log to console if database logging fails
      console.error('Failed to save audit log:', error);
      console.log('Audit log data:', JSON.stringify(data, null, 2));
      throw error;
    }
  }

  async getAuditLogs(options: {
    userId?: string;
    organizationId?: string;
    resource?: AuditResource;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC');

    if (options.userId) {
      query.andWhere('audit.userId = :userId', { userId: options.userId });
    }

    if (options.organizationId) {
      query.andWhere('audit.organizationId = :organizationId', { 
        organizationId: options.organizationId 
      });
    }

    if (options.resource) {
      query.andWhere('audit.resource = :resource', { resource: options.resource });
    }

    if (options.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    if (options.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: options.endDate });
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query.getManyAndCount();
  }

  async getAuditLogsByOrganizationHierarchy(organizationIds: string[], options: {
    resource?: AuditResource;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.organizationId IN (:...organizationIds)', { organizationIds })
      .orderBy('audit.createdAt', 'DESC');

    if (options.resource) {
      query.andWhere('audit.resource = :resource', { resource: options.resource });
    }

    if (options.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    if (options.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: options.endDate });
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query.getManyAndCount();
  }

  async getAuditSummary(organizationIds: string[]) {
    // Get total count
    const totalQuery = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.organizationId IN (:...organizationIds)', { organizationIds });
    
    const totalLogs = await totalQuery.getCount();

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentQuery = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.organizationId IN (:...organizationIds)', { organizationIds })
      .andWhere('audit.createdAt >= :yesterday', { yesterday })
      .orderBy('audit.createdAt', 'DESC')
      .limit(10);

    const recentActivity = await recentQuery.getMany();

    return {
      totalLogs,
      recentActivity,
      accessibleOrganizations: organizationIds.length,
    };
  }
}
