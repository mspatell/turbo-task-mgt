import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS_DENIED = 'access_denied',
}

export enum AuditResource {
  TASK = 'task',
  USER = 'user',
  ORGANIZATION = 'organization',
  AUTH = 'auth',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditResource,
  })
  resource: AuditResource;

  @Column({ nullable: true })
  resourceId: string;

  @Column('text', { nullable: true })
  details: string;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @ManyToOne('User', 'auditLogs', { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Static method to create audit log entry
  static create(data: {
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details?: string;
    metadata?: Record<string, any>;
    ipAddress: string;
    userAgent?: string;
    userId?: string;
    organizationId?: string;
  }): AuditLog {
    const auditLog = new AuditLog();
    Object.assign(auditLog, data);
    return auditLog;
  }
}
