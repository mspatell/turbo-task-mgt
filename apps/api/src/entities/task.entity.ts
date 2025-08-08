import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  HEALTH = 'health',
  SHOPPING = 'shopping',
  OTHER = 'other'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.BACKLOG,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskCategory,
    default: TaskCategory.OTHER,
  })
  category: TaskCategory;

  @Column({ nullable: true })
  dueDate: Date;

  @ManyToOne('User', 'tasks', { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: any;

  @Column()
  createdById: string;

  @ManyToOne('Organization', 'tasks', {
    nullable: false,
  })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to check if user can view this task
  canBeViewedBy(user: any): boolean {
    // Task must be in user's accessible organization hierarchy
    return user.hasAccessToOrganization(this.organizationId);
  }

  // Helper method to check if user can edit this task
  canBeEditedBy(user: any): boolean {
    // All users (Owner, Admin, and Viewer) can edit tasks in their organization hierarchy
    return user.hasAccessToOrganization(this.organizationId);
  }

  // Helper method to check if user can delete this task
  canBeDeletedBy(user: any): boolean {
    // Only Owner and Admin can delete tasks
    if (user.role === 'owner' || user.role === 'admin') {
      return user.hasAccessToOrganization(this.organizationId);
    }
    
    return false;
  }
}
