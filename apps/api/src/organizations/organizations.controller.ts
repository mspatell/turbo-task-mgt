import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@turbo-vets/auth';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  @Get('accessible')
  async getAccessibleOrganizations(@CurrentUser() user: User) {
    if (!user.organization) {
      return [];
    }

    // If user is in a parent organization and has appropriate role
    if (user.organization.isParentOrganization() && 
        (user.role === 'owner' || user.role === 'admin')) {
      
      // Get all organizations in the hierarchy
      const childOrganizations = await this.organizationRepository.find({
        where: { parentId: user.organizationId },
        select: ['id', 'name', 'description', 'parentId'],
      });

      return [
        {
          id: user.organization.id,
          name: user.organization.name,
          description: user.organization.description,
          parentId: user.organization.parentId,
        },
        ...childOrganizations,
      ];
    }

    // Otherwise, just their own organization
    return [
      {
        id: user.organization.id,
        name: user.organization.name,
        description: user.organization.description,
        parentId: user.organization.parentId,
      },
    ];
  }

  @Get()
  async getAllOrganizations(@CurrentUser() user: User) {
    // Only owners can see all organizations
    if (user.role !== 'owner') {
      return this.getAccessibleOrganizations(user);
    }

    return this.organizationRepository.find({
      select: ['id', 'name', 'description', 'parentId'],
      order: { name: 'ASC' },
    });
  }
}
