import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { AuditService } from '../services/audit.service';
import { UserRole } from '@turbo-vets/auth';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let organizationRepository: Repository<Organization>;
  let auditService: AuditService;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: mockOrganizationRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    organizationRepository = module.get<Repository<Organization>>(getRepositoryToken(Organization));
    auditService = module.get<AuditService>(AuditService);

    // Reset mocks
    mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  // Helper to create mock users
  const createMockUser = (role: UserRole, id = 'user-1', orgId = 'org-1') => ({
    id,
    email: `${role}@test.com`,
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role,
    isActive: true,
    organizationId: orgId,
    organization: {
      id: orgId,
      name: 'Test Org',
      parentId: null,
      isParentOrganization: () => true,
    },
    tasks: [],
    auditLogs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    hasAccessToOrganization: jest.fn().mockReturnValue(true),
    canManageUser: jest.fn().mockReturnValue(false),
  });

  const createMockTask = (id = 'task-1', createdById = 'user-1', orgId = 'org-1') => ({
    id,
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.BACKLOG,
    priority: TaskPriority.MEDIUM,
    createdById,
    organizationId: orgId,
    createdAt: new Date(),
    updatedAt: new Date(),
    canBeViewedBy: jest.fn().mockReturnValue(true),
    canBeEditedBy: jest.fn().mockReturnValue(true),
    canBeDeletedBy: jest.fn().mockReturnValue(true),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const mockUser = createMockUser(UserRole.OWNER);
    const createTaskDto = {
      title: 'New Task',
      description: 'Task Description',
      priority: TaskPriority.HIGH,
      organizationId: 'org-1',
    };
    const mockRequest = { 
      headers: { 'user-agent': 'test' }, 
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' }
    };

    it('should create a task successfully', async () => {
      const mockOrg = { id: 'org-1', name: 'Test Org' };
      const mockTask = createMockTask();
      
      mockOrganizationRepository.findOne.mockResolvedValue(mockOrg);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);
      mockAuditService.log.mockResolvedValue(undefined);

      const result = await service.createTask(createTaskDto, mockUser, mockRequest);

      expect(mockUser.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
      expect(organizationRepository.findOne).toHaveBeenCalledWith({ where: { id: 'org-1' } });
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        createdById: 'user-1',
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(auditService.log).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw ForbiddenException if user has no access to organization', async () => {
      mockUser.hasAccessToOrganization.mockReturnValue(false);

      await expect(service.createTask(createTaskDto, mockUser, mockRequest))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockUser.hasAccessToOrganization.mockReturnValue(true); // User has access but org doesn't exist
      mockOrganizationRepository.findOne.mockResolvedValue(null);

      await expect(service.createTask(createTaskDto, mockUser, mockRequest))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findTasksForUser', () => {
    it('should return all tasks for OWNER', async () => {
      const mockUser = createMockUser(UserRole.OWNER);
      const mockTasks = [createMockTask()];
      
      mockOrganizationRepository.find.mockResolvedValue([]);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 1]);

      const result = await service.findTasksForUser(mockUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('task.organizationId IN (:...orgIds)', { orgIds: ['org-1'] });
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('task.createdById = :userId', { userId: 'user-1' });
      expect(result).toEqual({ tasks: mockTasks, total: 1 });
    });

    it('should filter tasks for VIEWER (only their created tasks)', async () => {
      const mockUser = createMockUser(UserRole.VIEWER);
      const mockTasks = [createMockTask('task-1', 'user-1')];
      
      mockOrganizationRepository.find.mockResolvedValue([]);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 1]);

      const result = await service.findTasksForUser(mockUser);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.createdById = :userId', { userId: 'user-1' });
      expect(result).toEqual({ tasks: mockTasks, total: 1 });
    });

    it('should apply query filters', async () => {
      const mockUser = createMockUser(UserRole.ADMIN);
      const options = {
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        createdById: 'user-2',
        page: 2,
        limit: 5,
      };

      mockOrganizationRepository.find.mockResolvedValue([]);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findTasksForUser(mockUser, options);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', { status: TaskStatus.DONE });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.priority = :priority', { priority: TaskPriority.HIGH });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.createdById = :createdById', { createdById: 'user-2' });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(5); // page 2, limit 5 = offset 5
    });
  });

  describe('findTaskById', () => {
    const mockUser = createMockUser(UserRole.VIEWER);

    it('should return task if user has access', async () => {
      const mockTask = createMockTask();
      mockTask.canBeViewedBy.mockReturnValue(true);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findTaskById('task-1', mockUser);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        relations: ['createdBy', 'organization'],
      });
      expect(mockTask.canBeViewedBy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findTaskById('task-1', mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user cannot view task', async () => {
      const mockTask = createMockTask();
      mockTask.canBeViewedBy.mockReturnValue(false);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.findTaskById('task-1', mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTask', () => {
    const mockRequest = { 
      headers: { 'user-agent': 'test' }, 
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' }
    };

    it('should update task if user has permission', async () => {
      const mockUser = createMockUser(UserRole.ADMIN);
      const mockTask = createMockTask();
      const updateDto = { title: 'Updated Title', status: TaskStatus.DONE };

      mockTask.canBeEditedBy.mockReturnValue(true);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue({ ...mockTask, ...updateDto });

      const result = await service.updateTask('task-1', updateDto, mockUser, mockRequest);

      expect(mockTask.canBeEditedBy).toHaveBeenCalledWith(mockUser);
      expect(taskRepository.save).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should restrict VIEWER updates to only status and description', async () => {
      const mockUser = createMockUser(UserRole.VIEWER, 'user-1');
      const mockTask = createMockTask('task-1', 'user-1'); // User owns the task
      const updateDto = { 
        title: 'New Title',
        status: TaskStatus.DONE,
        description: 'Updated description',
        priority: TaskPriority.CRITICAL
      };

      mockTask.canBeEditedBy.mockReturnValue(true);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      await service.updateTask('task-1', updateDto, mockUser, mockRequest);

      // Should only update status and description, not title or priority
      expect(taskRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.DONE,
          description: 'Updated description',
        })
      );
    });

    it('should throw ForbiddenException if user cannot edit task', async () => {
      const mockUser = createMockUser(UserRole.VIEWER);
      const mockTask = createMockTask();
      mockTask.canBeEditedBy.mockReturnValue(false);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.updateTask('task-1', {}, mockUser, mockRequest))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteTask', () => {
    const mockRequest = { 
      headers: { 'user-agent': 'test' }, 
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' }
    };

    it('should delete task if user has permission', async () => {
      const mockUser = createMockUser(UserRole.OWNER);
      const mockTask = createMockTask();
      mockTask.canBeDeletedBy.mockReturnValue(true);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await service.deleteTask('task-1', mockUser, mockRequest);

      expect(mockTask.canBeDeletedBy).toHaveBeenCalledWith(mockUser);
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot delete task', async () => {
      const mockUser = createMockUser(UserRole.VIEWER);
      const mockTask = createMockTask();
      mockTask.canBeDeletedBy.mockReturnValue(false);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.deleteTask('task-1', mockUser, mockRequest))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
