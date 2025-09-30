import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '@turbo-vets/auth';
import { Organization } from '../entities/organization.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';

export interface CreateTaskDto {
  title: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate?: Date;
  organizationId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

export interface TaskQueryOptions {
  status?: TaskStatus;
  category?: TaskCategory;
  priority?: TaskPriority;
  createdById?: string;
  organizationId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private auditService: AuditService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, user: User, request: any): Promise<Task> {
    // Check if user has access to the organization
    if (!user.hasAccessToOrganization(createTaskDto.organizationId)) {
      throw new ForbiddenException('No access to this organization');
    }

    // Verify organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: createTaskDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: user.id,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log task creation
    await this.auditService.log({
      action: AuditAction.CREATE,
      resource: AuditResource.TASK,
      resourceId: savedTask.id,
      userId: user.id,
      organizationId: savedTask.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `Task "${savedTask.title}" created`,
      metadata: {
        taskId: savedTask.id,
        title: savedTask.title,
        priority: savedTask.priority,
      },
    });

    return savedTask;
  }

  async findTasksForUser(user: User, options: TaskQueryOptions = {}): Promise<{ tasks: Task[]; total: number }> {
    // Get all accessible organization IDs
    const accessibleOrgIds = await this.getAccessibleOrganizationIds(user);

    // If user has no accessible organizations, return empty result
    if (accessibleOrgIds.length === 0) {
      return { tasks: [], total: 0 };
    }

    const query = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.organization', 'organization')
      .where('task.organizationId IN (:...orgIds)', { orgIds: accessibleOrgIds });

    // Apply role-based filtering
    // All users (viewers, admins, owners) can see all tasks in their accessible organizations
    // No additional filtering needed - already filtered by accessible organization IDs

    // Apply filters
    if (options.status) {
      query.andWhere('task.status = :status', { status: options.status });
    }

    if (options.priority) {
      query.andWhere('task.priority = :priority', { priority: options.priority });
    }

    if (options.createdById) {
      query.andWhere('task.createdById = :createdById', { createdById: options.createdById });
    }

    if (options.organizationId) {
      query.andWhere('task.organizationId = :organizationId', { organizationId: options.organizationId });
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    query.limit(limit).offset(offset);
    query.orderBy('task.createdAt', 'DESC');

    const [tasks, total] = await query.getManyAndCount();

    return { tasks, total };
  }

  async findTaskById(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['createdBy', 'organization'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.canBeViewedBy(user)) {
      throw new ForbiddenException('No access to this task');
    }

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, user: User, request: any): Promise<Task> {
    const task = await this.findTaskById(id, user);

    if (!task.canBeEditedBy(user)) {
      throw new ForbiddenException('No permission to edit this task');
    }

    // Apply role-based restrictions on what can be updated
    let allowedUpdates = { ...updateTaskDto };
    
    if (user.role === UserRole.VIEWER) {
      // Viewers can update any task in their organization but cannot change organization
      // No additional restrictions needed beyond organization access check
    }

    const originalTask = { ...task };

    Object.assign(task, allowedUpdates);
    const updatedTask = await this.taskRepository.save(task);

    // Log task update
    await this.auditService.log({
      action: AuditAction.UPDATE,
      resource: AuditResource.TASK,
      resourceId: task.id,
      userId: user.id,
      organizationId: task.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `Task "${task.title}" updated`,
      metadata: {
        taskId: task.id,
        changes: this.getChanges(originalTask, allowedUpdates),
      },
    });

    return updatedTask;
  }

  async deleteTask(id: string, user: User, request: any): Promise<void> {
    const task = await this.findTaskById(id, user);

    if (!task.canBeDeletedBy(user)) {
      throw new ForbiddenException('No permission to delete this task');
    }

    await this.taskRepository.remove(task);

    // Log task deletion
    await this.auditService.log({
      action: AuditAction.DELETE,
      resource: AuditResource.TASK,
      resourceId: task.id,
      userId: user.id,
      organizationId: task.organizationId,
      ipAddress: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      details: `Task "${task.title}" deleted`,
      metadata: {
        taskId: task.id,
        title: task.title,
      },
    });
  }

  private async getAccessibleOrganizationIds(user: User): Promise<string[]> {
    if (!user.organizationId || !user.organization) {
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

  private getChanges(original: any, updates: any): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};

    Object.keys(updates).forEach(key => {
      if (original[key] !== updates[key]) {
        changes[key] = {
          from: original[key],
          to: updates[key],
        };
      }
    });

    return changes;
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
