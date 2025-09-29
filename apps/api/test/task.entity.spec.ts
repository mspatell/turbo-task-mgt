import { Task, TaskStatus, TaskPriority } from './task.entity';
import { UserRole } from '@turbo-vets/auth';

describe('Task Entity', () => {
  let task: Task;

  beforeEach(() => {
    task = new Task();
    task.id = 'task-1';
    task.title = 'Test Task';
    task.description = 'Test Description';
    task.status = TaskStatus.BACKLOG;
    task.priority = TaskPriority.MEDIUM;
    task.createdById = 'user-1';
    task.organizationId = 'org-1';
    task.createdAt = new Date();
    task.updatedAt = new Date();
  });

  const createMockUser = (role: UserRole, id: string, orgId: string) => ({
    id,
    role,
    organizationId: orgId,
    hasAccessToOrganization: jest.fn().mockImplementation((targetOrgId) => targetOrgId === orgId),
  });

  describe('canBeViewedBy', () => {
    it('should allow user to view task if they have access to organization', () => {
      const user = createMockUser(UserRole.VIEWER, 'user-2', 'org-1');
      
      const result = task.canBeViewedBy(user);
      
      expect(result).toBe(true);
      expect(user.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
    });

    it('should deny access if user has no access to organization', () => {
      const user = createMockUser(UserRole.VIEWER, 'user-2', 'org-2');
      user.hasAccessToOrganization.mockReturnValue(false);
      
      const result = task.canBeViewedBy(user);
      
      expect(result).toBe(false);
    });
  });

  describe('canBeEditedBy', () => {
    it('should allow OWNER to edit any task in their organization', () => {
      const user = createMockUser(UserRole.OWNER, 'user-2', 'org-1');
      
      const result = task.canBeEditedBy(user);
      
      expect(result).toBe(true);
      expect(user.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
    });

    it('should allow ADMIN to edit any task in their organization', () => {
      const user = createMockUser(UserRole.ADMIN, 'user-2', 'org-1');
      
      const result = task.canBeEditedBy(user);
      
      expect(result).toBe(true);
      expect(user.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
    });

    it('should allow VIEWER to edit only tasks they created', () => {
      const user = createMockUser(UserRole.VIEWER, 'user-1', 'org-1'); // Same as createdById
      
      const result = task.canBeEditedBy(user);
      
      expect(result).toBe(true);
    });

    it('should deny VIEWER from editing tasks they did not create', () => {
      const user = createMockUser(UserRole.VIEWER, 'user-2', 'org-1'); // Different from createdById
      
      const result = task.canBeEditedBy(user);
      
      expect(result).toBe(false);
    });

    it('should deny access if user has no access to organization', () => {
      const user = createMockUser(UserRole.OWNER, 'user-2', 'org-2');
      user.hasAccessToOrganization.mockReturnValue(false);
      
      const result = task.canBeEditedBy(user);
      
      expect(result).toBe(false);
    });
  });

  describe('canBeDeletedBy', () => {
    it('should allow OWNER to delete tasks in their organization', () => {
      const user = createMockUser(UserRole.OWNER, 'user-2', 'org-1');
      
      const result = task.canBeDeletedBy(user);
      
      expect(result).toBe(true);
      expect(user.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
    });

    it('should allow ADMIN to delete tasks in their organization', () => {
      const user = createMockUser(UserRole.ADMIN, 'user-2', 'org-1');
      
      const result = task.canBeDeletedBy(user);
      
      expect(result).toBe(true);
      expect(user.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
    });

    it('should deny VIEWER from deleting any tasks', () => {
      const user = createMockUser(UserRole.VIEWER, 'user-1', 'org-1'); // Even their own tasks
      
      const result = task.canBeDeletedBy(user);
      
      expect(result).toBe(false);
    });

    it('should deny access if user has no access to organization', () => {
      const user = createMockUser(UserRole.OWNER, 'user-2', 'org-2');
      user.hasAccessToOrganization.mockReturnValue(false);
      
      const result = task.canBeDeletedBy(user);
      
      expect(result).toBe(false);
    });
  });
});
