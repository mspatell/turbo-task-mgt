import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
  Header,
  Res,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, Roles, UserRole, RolesGuard } from '@turbo-vets/auth';
import { AuditService } from '../services/audit.service';
import { User } from '../entities/user.entity';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

class AuditLogQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsEnum(AuditResource)
  resource?: AuditResource;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class AuditController {
  constructor(
    private auditService: AuditService,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  @Get()
  async getAuditLogs(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: User,
    @Headers('accept') accept: string,
    @Res() res?: Response,
  ) {
    // Validate access to requested organization
    if (query.organizationId && !user.hasAccessToOrganization(query.organizationId)) {
      throw new ForbiddenException('No access to audit logs for this organization');
    }

    // If no organization specified, use user's accessible organizations
    let auditLogs, total;
    if (!query.organizationId) {
      const accessibleOrgIds = await this.getAccessibleOrganizationIds(user);
      
      if (accessibleOrgIds.length === 0) {
        auditLogs = [];
        total = 0;
      } else {
        // Use organization hierarchy for broader access
        [auditLogs, total] = await this.auditService.getAuditLogsByOrganizationHierarchy(accessibleOrgIds, {
          resource: query.resource,
          action: query.action,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
          limit: query.limit || 1000, // Increase limit for CSV downloads
          offset: query.offset || 0,
        });
      }
    } else {
      // Get audit logs for specific organization
      [auditLogs, total] = await this.auditService.getAuditLogs({
        userId: query.userId,
        organizationId: query.organizationId,
        resource: query.resource,
        action: query.action,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        limit: query.limit || 1000, // Increase limit for CSV downloads
        offset: query.offset || 0,
      });
    }

    // Check if CSV format is requested
    if (accept && accept.includes('text/csv')) {
      const csv = this.convertToCSV(auditLogs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(csv);
    }

    return { auditLogs, total };
  }

  @Get('summary')
  async getAuditSummary(
    @CurrentUser() user: User,
    @Headers('accept') accept: string,
    @Res() res?: Response,
  ) {
    const accessibleOrgIds = await this.getAccessibleOrganizationIds(user);
    
    if (accessibleOrgIds.length === 0) {
      const emptyResult = {
        totalLogs: 0,
        recentActivity: [],
        accessibleOrganizations: 0,
      };
      
      if (accept && accept.includes('text/csv')) {
        const csv = this.convertSummaryToCSV(emptyResult);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-summary.csv');
        return res.send(csv);
      }
      
      return emptyResult;
    }

    const result = await this.auditService.getAuditSummary(accessibleOrgIds);

    // Check if CSV format is requested
    if (accept && accept.includes('text/csv')) {
      const csv = this.convertSummaryToCSV(result);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-summary.csv');
      return res.send(csv);
    }

    return result;
  }

  private async getAccessibleOrganizationIds(user: User): Promise<string[]> {
    if (!user.organization) {
      return [];
    }

    // If user is in a parent organization and has appropriate role
    if (user.organization.isParentOrganization() && 
        (user.role === UserRole.OWNER || user.role === UserRole.ADMIN)) {
      
      const childOrganizations = await this.organizationRepository.find({
        where: { parentId: user.organizationId },
      });

      return [
        user.organizationId,
        ...childOrganizations.map(org => org.id),
      ];
    }

    // Otherwise, just their own organization
    return [user.organizationId];
  }

  private convertToCSV(auditLogs: any[]): string {
    if (auditLogs.length === 0) {
      return 'No audit logs found';
    }

    // CSV Headers
    const headers = [
      'Timestamp',
      'User Name',
      'User Email',
      'Action',
      'Resource',
      'Resource ID',
      'Details',
      'IP Address',
      'Organization'
    ];

    // Convert data to CSV rows
    const rows = auditLogs.map(log => [
      log.createdAt,
      log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
      log.user ? log.user.email : 'N/A',
      log.action,
      log.resource,
      log.resourceId || 'N/A',
      log.details || 'N/A',
      log.ipAddress || 'N/A',
      log.user?.organization?.name || 'N/A'
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private convertSummaryToCSV(summary: any): string {
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Logs', summary.totalLogs],
      ['Accessible Organizations', summary.accessibleOrganizations],
      ['Recent Activity Count', summary.recentActivity?.length || 0]
    ];

    let csvContent = summaryData
      .map(row => row.map(field => `"${String(field)}"`).join(','))
      .join('\n');

    // Add recent activity section if available
    if (summary.recentActivity && summary.recentActivity.length > 0) {
      csvContent += '\n\nRecent Activity:\n';
      csvContent += 'Timestamp,User,Action,Resource,Details\n';
      
      summary.recentActivity.forEach(activity => {
        const row = [
          activity.createdAt,
          activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System',
          activity.action,
          activity.resource,
          activity.details || 'N/A'
        ];
        csvContent += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
      });
    }

    return csvContent;
  }
}
