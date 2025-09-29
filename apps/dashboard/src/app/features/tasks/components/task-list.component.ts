import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskStatus, User, UserRole } from '@turbo-vets/data';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, DragDropModule],
  template: `
    <div 
      cdkDropList
      [id]="status"
      [cdkDropListData]="tasks"
      [cdkDropListConnectedTo]="connectedLists"
      (cdkDropListDropped)="drop($event)"
      class="min-h-[200px] space-y-3">
      
      <div
        *ngFor="let task of tasks; trackBy: trackByTaskId"
        cdkDrag
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 cursor-move">
        
        <!-- Drag Handle -->
        <div cdkDragHandle class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
            <span *ngIf="task.priority" [class]="getPriorityClass(task.priority)" class="text-xs font-medium px-2 py-1 rounded">
              {{ task.priority.toUpperCase() }}
            </span>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-1">
            <button
              (click)="editTask.emit(task)"
              class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              *ngIf="canDeleteTask()"
              (click)="deleteTask.emit(task.id)"
              class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Task Content -->
        <div class="space-y-2">
          <h4 class="font-medium text-gray-900 dark:text-white">{{ task.title }}</h4>
          <p *ngIf="task.description" class="text-sm text-gray-600 dark:text-gray-400">
            {{ task.description }}
          </p>
          
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span *ngIf="task.category" [class]="getCategoryClass(task.category)" class="px-2 py-1 rounded">
              {{ task.category.charAt(0).toUpperCase() + task.category.slice(1) }}
            </span>
            
            <div class="flex items-center space-x-2">
              <span *ngIf="task.dueDate" class="flex items-center space-x-1" [class.text-red-500]="isOverdue(task.dueDate)">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatDate(task.dueDate) }}</span>
              </span>
              
              <span class="text-gray-400">{{ formatDate(task.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Status Change Buttons -->
        <div class="mt-3 flex space-x-2">
          <button
            *ngIf="task.status !== 'backlog'"
            (click)="onStatusChange('backlog', task.id)"
            class="text-xs px-2 py-1 border border-purple-300 dark:border-purple-600 rounded text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900">
            Backlog
          </button>
          <button
            *ngIf="task.status !== 'todo'"
            (click)="onStatusChange('todo', task.id)"
            class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
            To Do
          </button>
          <button
            *ngIf="task.status !== 'in-progress'"
            (click)="onStatusChange('in-progress', task.id)"
            class="text-xs px-2 py-1 border border-blue-300 dark:border-blue-600 rounded text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900">
            In Progress
          </button>
          <button
            *ngIf="task.status !== 'done'"
            (click)="onStatusChange('done', task.id)"
            class="text-xs px-2 py-1 border border-green-300 dark:border-green-600 rounded text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900">
            Done
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="tasks.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-14a2 2 0 012-2h2a2 2 0 012 2m0 0v14a2 2 0 01-2 2H9m0-14h6m-6 0v14" />
        </svg>
        <p class="mt-2">No tasks in this status</p>
      </div>
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Input() status = '';
  @Input() currentUser: User | null = null;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ taskId: string; status: TaskStatus }>();
  @Output() reorder = new EventEmitter<string[]>();

  connectedLists = ['backlog', 'todo', 'in-progress', 'done'];

  canDeleteTask(): boolean {
    // Only OWNER and ADMIN can delete tasks, VIEWER cannot
    return this.currentUser?.role === UserRole.OWNER || this.currentUser?.role === UserRole.ADMIN;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Reorder within same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const taskIds = event.container.data.map(task => task.id);
      this.reorder.emit(taskIds);
    } else {
      // Move between lists (status change)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromListId(event.container.id);
      
      if (newStatus) {
        this.statusChange.emit({ taskId: task.id, status: newStatus });
      }
    }
  }

  onStatusChange(status: string, taskId: string) {
    this.statusChange.emit({ taskId, status: status as TaskStatus });
  }

  getPriorityClass(priority: string | undefined | null): string {
    if (!priority) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getCategoryClass(category: string | undefined | null): string {
    if (!category) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'health':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'shopping':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  private getStatusFromListId(listId: string): TaskStatus | null {
    switch (listId) {
      case 'backlog':
        return TaskStatus.BACKLOG;
      case 'todo':
        return TaskStatus.TODO;
      case 'in-progress':
        return TaskStatus.IN_PROGRESS;
      case 'done':
        return TaskStatus.DONE;
      default:
        return null;
    }
  }
}
