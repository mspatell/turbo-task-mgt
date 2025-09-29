import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

// Entities
import { User, Organization, Task, AuditLog } from './entities';

// Auth
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from '@turbo-vets/auth';

// Services
import { AuditService } from './services/audit.service';
import { DataSeederService } from './seeders/data-seeder.service';

// Controllers
import { TaskController } from './tasks/task.controller';
import { TaskService } from './tasks/task.service';
import { AuditController } from './audit/audit.controller';
import { OrganizationsController } from './organizations/organizations.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'turbo_vets',
      entities: [User, Organization, Task, AuditLog],
      synchronize: process.env.NODE_ENV === 'development', // Only in development
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([User, Organization, Task, AuditLog]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    AuthController,
    TaskController,
    AuditController,
    OrganizationsController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    AuditService,
    TaskService,
    DataSeederService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    RolesGuard,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSeederService: DataSeederService) {}

  async onModuleInit() {
    // Seed data on startup
    await this.dataSeederService.seed();
  }
}
