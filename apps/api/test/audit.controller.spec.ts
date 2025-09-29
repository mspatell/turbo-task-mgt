import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from '../services/audit.service';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '@turbo-vets/auth';
import { ForbiddenException } from '@nestjs/common';

describe('AuditController', () => {
  let controller: AuditController;
  let auditService: AuditService;
  let organizationRepository: Repository<Organization>;

  const mockAuditService = {
    getAuditLogs: jest.fn(),
    getAuditLogsByOrganizationHierarchy: jest.fn(),
  };

  const mockOrganizationRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: mockOrganizationRepository,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    auditService = module.get<AuditService>(AuditService);
    organizationRepository = module.get<Repository<Organization>>(getRepositoryToken(Organization));
  });

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuditLogs', () => {
    beforeEach(() => {
      mockOrganizationRepository.find.mockResolvedValue([
        { id: 'child-org-1' },
        { id: 'child-org-2' },
      ]);
      mockAuditService.getAuditLogsByOrganizationHierarchy.mockResolvedValue([
        { auditLogs: [], total: 0 },
      ]);
      mockAuditService.getAuditLogs.mockResolvedValue({
        auditLogs: [],
        total: 0,
      });
    });

    it('should allow OWNER to access audit logs', async () => {
      const mockOwner = createMockUser(UserRole.OWNER);

      const result = await controller.getAuditLogs({}, mockOwner);

      expect(result).toBeDefined();
      expect(mockAuditService.getAuditLogsByOrganizationHierarchy).toHaveBeenCalled();
    });

    it('should allow ADMIN to access audit logs', async () => {
      const mockAdmin = createMockUser(UserRole.ADMIN);

      const result = await controller.getAuditLogs({}, mockAdmin);

      expect(result).toBeDefined();
      expect(mockAuditService.getAuditLogsByOrganizationHierarchy).toHaveBeenCalled();
    });

    it('should restrict access to specific organization if user lacks access', async () => {
      const mockOwner = createMockUser(UserRole.OWNER);
      mockOwner.hasAccessToOrganization.mockReturnValue(false);

      await expect(
        controller.getAuditLogs({ organizationId: 'unauthorized-org' }, mockOwner)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle empty accessible organizations', async () => {
      const userWithNoOrg = createMockUser(UserRole.OWNER);
      userWithNoOrg.organization = null;

      const result = await controller.getAuditLogs({}, userWithNoOrg);

      expect(result).toEqual({ auditLogs: [], total: 0 });
    });

    it('should use specific organization when provided', async () => {
      const mockOwner = createMockUser(UserRole.OWNER);
      const query = { organizationId: 'org-1' };

      await controller.getAuditLogs(query, mockOwner);

      expect(mockOwner.hasAccessToOrganization).toHaveBeenCalledWith('org-1');
      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-1',
        })
      );
    });

    it('should apply query filters', async () => {
      const mockAdmin = createMockUser(UserRole.ADMIN);
      const query = {
        organizationId: 'org-1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        limit: 25,
        offset: 10,
      };

      await controller.getAuditLogs(query, mockAdmin);

      expect(mockAuditService.getAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          limit: 25,
          offset: 10,
        })
      );
    });
  });

  describe('getAuditSummary', () => {
    beforeEach(() => {
      mockOrganizationRepository.find.mockResolvedValue([]);
      mockAuditService.getAuditLogsByOrganizationHierarchy.mockResolvedValue([
        [],
        0,
      ]);
    });

    it('should return audit summary for authorized users', async () => {
      const mockOwner = createMockUser(UserRole.OWNER);

      const result = await controller.getAuditSummary(mockOwner);

      expect(result).toHaveProperty('totalLogs');
      expect(result).toHaveProperty('recentActivity');
      expect(result).toHaveProperty('accessibleOrganizations');
      expect(mockAuditService.getAuditLogsByOrganizationHierarchy).toHaveBeenCalledTimes(2);
    });

    it('should return empty summary for users with no organizations', async () => {
      const userWithNoOrg = createMockUser(UserRole.ADMIN);
      userWithNoOrg.organization = null;

      const result = await controller.getAuditSummary(userWithNoOrg);

      expect(result.totalLogs).toBe(0);
      expect(result.recentActivity).toEqual([]);
      expect(result.topActions).toEqual([]);
      expect(result.topResources).toEqual([]);
      // accessibleOrganizations is not included when there are no organizations
      expect(result).not.toHaveProperty('accessibleOrganizations');
    });

    it('should fetch recent activity from last 24 hours', async () => {
      const mockAdmin = createMockUser(UserRole.ADMIN);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await controller.getAuditSummary(mockAdmin);

      expect(mockAuditService.getAuditLogsByOrganizationHierarchy).toHaveBeenCalledWith(
        ['org-1'],
        expect.objectContaining({
          startDate: expect.any(Date),
          limit: 10,
        })
      );
    });
  });

  describe('getAccessibleOrganizationIds (private method behavior)', () => {
    it('should return organization hierarchy for parent organization users', async () => {
      const mockOwner = createMockUser(UserRole.OWNER);
      mockOrganizationRepository.find.mockResolvedValue([
        { id: 'child-1' },
        { id: 'child-2' },
      ]);

      await controller.getAuditLogs({}, mockOwner);

      // Verify that child organizations are queried
      expect(mockOrganizationRepository.find).toHaveBeenCalledWith({
        where: { parentId: 'org-1' },
      });
    });

    it('should handle users in child organizations', async () => {
      const childOrgUser = createMockUser(UserRole.ADMIN, 'user-2', 'child-org-1');
      childOrgUser.organization.parentId = 'parent-org';
      childOrgUser.organization.isParentOrganization = () => false;

      mockOrganizationRepository.find.mockResolvedValue([]);

      await controller.getAuditLogs({}, childOrgUser);

      // Should not query for child organizations since this user is in a child org
      expect(mockOrganizationRepository.find).not.toHaveBeenCalled();
    });
  });
});
