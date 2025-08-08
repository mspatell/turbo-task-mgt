import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, Roles, UserRole, RolesGuard } from '@turbo-vets/auth';
import { TaskService, CreateTaskDto, UpdateTaskDto, TaskQueryOptions } from './task.service';
import { User } from '../entities/user.entity';
import { TaskStatus, TaskPriority, TaskCategory } from '../entities/task.entity';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateTaskRequestDto implements CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsUUID()
  organizationId: string;
}

class UpdateTaskRequestDto implements UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}

class TaskQueryDto implements TaskQueryOptions {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid task data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createTask(
    @Body() createTaskDto: CreateTaskRequestDto,
    @CurrentUser() user: User,
    @Request() req,
  ) {
    return this.taskService.createTask(createTaskDto, user, req);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get tasks with optional filtering' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'category', enum: TaskCategory, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getTasks(
    @Query() query: TaskQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findTasksForUser(user, query);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.taskService.findTaskById(id, user);
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.VIEWER)
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskRequestDto,
    @CurrentUser() user: User,
    @Request() req,
  ) {
    return this.taskService.updateTask(id, updateTaskDto, user, req);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Request() req,
  ) {
    await this.taskService.deleteTask(id, user, req);
    return { message: 'Task deleted successfully' };
  }
}
