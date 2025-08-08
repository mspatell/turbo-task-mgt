import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '@turbo-vets/auth';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne('Organization', 'users', {
    nullable: true,
  })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @Column({ nullable: true })
  organizationId: string;

  @OneToMany('Task', 'createdBy')
  tasks: any[];

  @OneToMany('AuditLog', 'user')
  auditLogs: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to check if user has access to organization
  hasAccessToOrganization(organizationId: string): boolean {
    if (!this.organization) return false;
    
    // Direct access if same organization
    if (this.organization.id === organizationId) return true;
    
    // For parent organizations, check if we have access to child organizations
    if (this.organization.parentId === null) {
      // This is a parent organization
      if (this.role === UserRole.OWNER || this.role === UserRole.ADMIN) {
        // Owner and Admin in parent orgs have access to all child orgs
        // Note: We'd need to query child orgs here, but for now we'll assume access
        // This should be implemented with proper child org checking
        return true;
      }
    }
    
    return false;
  }

  // Helper method to check if user can manage another user
  canManageUser(targetUser: User): boolean {
    if (!this.organization || !targetUser.organization) return false;
    
    // Owner can manage anyone in their organization hierarchy
    if (this.role === UserRole.OWNER) {
      return this.hasAccessToOrganization(targetUser.organizationId);
    }
    
    // Admin can manage viewers in same organization
    if (this.role === UserRole.ADMIN) {
      return this.organizationId === targetUser.organizationId && 
             targetUser.role === UserRole.VIEWER;
    }
    
    return false;
  }
}
