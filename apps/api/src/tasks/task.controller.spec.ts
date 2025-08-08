import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { UserRole } from '@turbo-vets/auth';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockTaskService = {
    createTask: jest.fn(),
    findTasksForUser: jest.fn(),
    findTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  // Create mock users with all required properties
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

  describe('Role-based access tests', () => {
    const mockOwner = createMockUser(UserRole.OWNER);
    const mockAdmin = createMockUser(UserRole.ADMIN, 'user-2');
    const mockViewer = createMockUser(UserRole.VIEWER, 'user-3');

    const mockCreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.MEDIUM,
      organizationId: 'org-1',
    };

    const mockRequest = {
      headers: { 'user-agent': 'test' },
      ip: '127.0.0.1',
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createTask', () => {
      it('should allow OWNER to create tasks', async () => {
        const expectedTask = { id: 'task-1', ...mockCreateTaskDto };
        mockTaskService.createTask.mockResolvedValue(expectedTask);

        const result = await controller.createTask(mockCreateTaskDto, mockOwner, mockRequest);

        expect(service.createTask).toHaveBeenCalledWith(mockCreateTaskDto, mockOwner, mockRequest);
        expect(result).toEqual(expectedTask);
      });

      it('should allow ADMIN to create tasks', async () => {
        const expectedTask = { id: 'task-1', ...mockCreateTaskDto };
        mockTaskService.createTask.mockResolvedValue(expectedTask);

        const result = await controller.createTask(mockCreateTaskDto, mockAdmin, mockRequest);

        expect(service.createTask).toHaveBeenCalledWith(mockCreateTaskDto, mockAdmin, mockRequest);
        expect(result).toEqual(expectedTask);
      });

      // Note: VIEWERs are blocked by @Roles decorator, so they can't reach this method
    });

    describe('getTasks', () => {
      it('should return tasks for OWNER', async () => {
        const mockTasks = { tasks: [{ id: 'task-1', title: 'Test' }], total: 1 };
        mockTaskService.findTasksForUser.mockResolvedValue(mockTasks);

        const result = await controller.getTasks({}, mockOwner);

        expect(service.findTasksForUser).toHaveBeenCalledWith(mockOwner, {});
        expect(result).toEqual(mockTasks);
      });

      it('should return filtered tasks for VIEWER', async () => {
        const mockTasks = { tasks: [{ id: 'task-1', title: 'My Task' }], total: 1 };
        mockTaskService.findTasksForUser.mockResolvedValue(mockTasks);

        const result = await controller.getTasks({}, mockViewer);

        expect(service.findTasksForUser).toHaveBeenCalledWith(mockViewer, {});
        expect(result).toEqual(mockTasks);
      });

      it('should apply query filters', async () => {
        const queryOptions = { status: TaskStatus.DONE, priority: TaskPriority.HIGH };
        const mockTasks = { tasks: [], total: 0 };
        mockTaskService.findTasksForUser.mockResolvedValue(mockTasks);

        await controller.getTasks(queryOptions, mockOwner);

        expect(service.findTasksForUser).toHaveBeenCalledWith(mockOwner, queryOptions);
      });
    });

    describe('getTask', () => {
      it('should return task if user has access', async () => {
        const mockTask = { id: 'task-1', title: 'Test Task' };
        mockTaskService.findTaskById.mockResolvedValue(mockTask);

        const result = await controller.getTask('task-1', mockOwner);

        expect(service.findTaskById).toHaveBeenCalledWith('task-1', mockOwner);
        expect(result).toEqual(mockTask);
      });
    });

    describe('updateTask', () => {
      const mockUpdateDto = { status: TaskStatus.DONE, description: 'Updated' };

      it('should allow OWNER to update any task', async () => {
        const mockTask = { id: 'task-1', title: 'Test' };
        mockTaskService.updateTask.mockResolvedValue(mockTask);

        const result = await controller.updateTask('task-1', mockUpdateDto, mockOwner, mockRequest);

        expect(service.updateTask).toHaveBeenCalledWith('task-1', mockUpdateDto, mockOwner, mockRequest);
        expect(result).toEqual(mockTask);
      });

      it('should allow VIEWER to update their own tasks', async () => {
        const mockTask = { id: 'task-1', title: 'Test' };
        mockTaskService.updateTask.mockResolvedValue(mockTask);

        const result = await controller.updateTask('task-1', mockUpdateDto, mockViewer, mockRequest);

        expect(service.updateTask).toHaveBeenCalledWith('task-1', mockUpdateDto, mockViewer, mockRequest);
        expect(result).toEqual(mockTask);
      });
    });

    describe('deleteTask', () => {
      it('should allow OWNER to delete tasks', async () => {
        mockTaskService.deleteTask.mockResolvedValue(undefined);

        const result = await controller.deleteTask('task-1', mockOwner, mockRequest);

        expect(service.deleteTask).toHaveBeenCalledWith('task-1', mockOwner, mockRequest);
        expect(result.message).toBe('Task deleted successfully');
      });

      it('should allow ADMIN to delete tasks', async () => {
        mockTaskService.deleteTask.mockResolvedValue(undefined);

        const result = await controller.deleteTask('task-1', mockAdmin, mockRequest);

        expect(service.deleteTask).toHaveBeenCalledWith('task-1', mockAdmin, mockRequest);
        expect(result.message).toBe('Task deleted successfully');
      });

      // Note: VIEWERs are blocked by @Roles decorator for DELETE
    });
  });
});
