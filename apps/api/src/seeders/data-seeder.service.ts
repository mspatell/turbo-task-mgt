import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { UserRole } from '@turbo-vets/auth';
import { Organization } from '../entities/organization.entity';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';

@Injectable()
export class DataSeederService {
  private readonly logger = new Logger(DataSeederService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async seed() {
    this.logger.log('Starting data seeding...');

    // Check if data already exists
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log('Data already exists, skipping seeding');
      return;
    }

    // Create organizations
    const parentOrg = await this.createOrganization({
      name: 'HQ',
      description: 'Main organization',
    });

    const childOrg1 = await this.createOrganization({
      name: 'Downtown',
      description: 'Downtown Office',
      parentId: parentOrg.id,
    });

    const childOrg2 = await this.createOrganization({
      name: 'Uptown',
      description: 'Uptown Office',
      parentId: parentOrg.id,
    });

    // Create users
    const owner = await this.createUser({
      email: 'owner@turbovets.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Owner',
      role: UserRole.OWNER,
      organizationId: parentOrg.id,
    });

    const admin = await this.createUser({
      email: 'admin@turbovets.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      organizationId: parentOrg.id,
    });

    const viewer1 = await this.createUser({
      email: 'vet1@turbovets.com',
      password: 'password123',
      firstName: 'Dr. Alice',
      lastName: 'Veterinarian',
      role: UserRole.VIEWER,
      organizationId: childOrg1.id,
    });

    const viewer2 = await this.createUser({
      email: 'vet2@turbovets.com',
      password: 'password123',
      firstName: 'Dr. Bob',
      lastName: 'Veterinarian',
      role: UserRole.VIEWER,
      organizationId: childOrg2.id,
    });

    // Create sample tasks
    await this.createTask({
      title: 'Update inventory system',
      description: 'Implement new inventory tracking for medical supplies',
      priority: TaskPriority.HIGH,
      createdById: owner.id,
      organizationId: parentOrg.id,
      assignedToId: admin.id,
    });

    await this.createTask({
      title: 'Schedule staff training',
      description: 'Organize training session for new equipment',
      priority: TaskPriority.MEDIUM,
      createdById: admin.id,
      organizationId: childOrg1.id,
      assignedToId: viewer1.id,
    });

    await this.createTask({
      title: 'Review patient records',
      description: 'Annual review of patient database',
      priority: TaskPriority.LOW,
      status: TaskStatus.IN_PROGRESS,
      createdById: viewer1.id,
      organizationId: childOrg1.id,
    });

    await this.createTask({
      title: 'Equipment maintenance',
      description: 'Monthly maintenance check for lab equipment',
      priority: TaskPriority.CRITICAL,
      createdById: viewer2.id,
      organizationId: childOrg2.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    this.logger.log('Data seeding completed successfully!');
    this.logger.log('Sample users created:');
    this.logger.log(`- Owner: owner@turbovets.com / password123`);
    this.logger.log(`- Admin: admin@turbovets.com / password123`);
    this.logger.log(`- Vet 1: vet1@turbovets.com / password123`);
    this.logger.log(`- Vet 2: vet2@turbovets.com / password123`);
  }

  private async createOrganization(data: {
    name: string;
    description: string;
    parentId?: string;
  }): Promise<Organization> {
    const organization = this.organizationRepository.create(data);
    return this.organizationRepository.save(organization);
  }

  private async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  private async createTask(data: {
    title: string;
    description: string;
    priority: TaskPriority;
    createdById: string;
    organizationId: string;
    assignedToId?: string;
    status?: TaskStatus;
    dueDate?: Date;
  }): Promise<Task> {
    const task = this.taskRepository.create(data);
    return this.taskRepository.save(task);
  }
}
