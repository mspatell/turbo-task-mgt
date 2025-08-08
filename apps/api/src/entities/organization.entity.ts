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

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  // Parent organization (for 2-level hierarchy)
  @ManyToOne('Organization', 'children', {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Organization;

  @Column({ nullable: true })
  parentId: string;

  // Child organizations
  @OneToMany('Organization', 'parent')
  children: Organization[];

  @OneToMany('User', 'organization')
  users: any[];

  @OneToMany('Task', 'organization')
  tasks: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to check if this is a parent organization
  isParentOrganization(): boolean {
    return this.parentId === null;
  }

  // Helper method to get all organization IDs in hierarchy
  getOrganizationHierarchyIds(): string[] {
    const ids = [this.id];
    
    if (this.isParentOrganization() && this.children) {
      this.children.forEach(child => {
        ids.push(child.id);
      });
    }
    
    return ids;
  }
}
