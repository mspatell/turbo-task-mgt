import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { 
  selectCurrentUser, 
  selectSortedTasks, 
  selectTasksByStatus,
  selectTasksLoading,
  selectTaskFilter,
  selectTaskCategories
} from '../../../store/selectors';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as TaskActions from '../../../store/tasks/task.actions';
import { User, Task, TaskStatus } from '@turbo-vets/data';
import { TaskListComponent } from '../../tasks/components/task-list.component';
import { TaskFormComponent } from '../../tasks/components/task-form.component';
import { HeaderComponent } from '../../../layout/header/header.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TaskListComponent, TaskFormComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <app-header 
        [user]="currentUser$ | async"
        (logout)="onLogout()"
        (toggleTheme)="toggleTheme()">
      </app-header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Dashboard Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Task Dashboard</h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your tasks efficiently with drag-and-drop functionality
            </p>
          </div>

          <!-- Controls -->
          <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <!-- Filters -->
            <div class="flex flex-wrap gap-2">
              <select 
                (change)="onFilterChange($event)"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Tasks</option>
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <optgroup label="Categories">
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </optgroup>
              </select>

              <select 
                (change)="onSortChange($event)"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="createdAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
              </select>
            </div>

            <!-- Add Task Button -->
            <button
              (click)="showTaskForm = !showTaskForm"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Task
            </button>
          </div>

          <!-- Task Form -->
          <div *ngIf="showTaskForm" class="mb-8">
            <app-task-form
              [task]="editingTask"
              (save)="onTaskSave($event)"
              (cancel)="onTaskFormCancel()">
            </app-task-form>
          </div>

          <!-- Loading State -->
          <div *ngIf="tasksLoading$ | async" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <!-- Task Board View -->
          <div *ngIf="!(tasksLoading$ | async)" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Backlog Column -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Backlog</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {{ (tasksByStatus$ | async)?.backlog?.length || 0 }}
                </span>
              </div>
              <app-task-list
                [tasks]="(tasksByStatus$ | async)?.backlog || []"
                [currentUser]="currentUser$ | async"
                status="backlog"
                (editTask)="onEditTask($event)"
                (deleteTask)="onDeleteTask($event)"
                (statusChange)="onStatusChange($event)"
                (reorder)="onReorder($event)">
              </app-task-list>
            </div>

            <!-- To Do Column -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">To Do</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {{ (tasksByStatus$ | async)?.todo?.length || 0 }}
                </span>
              </div>
              <app-task-list
                [tasks]="(tasksByStatus$ | async)?.todo || []"
                [currentUser]="currentUser$ | async"
                status="todo"
                (editTask)="onEditTask($event)"
                (deleteTask)="onDeleteTask($event)"
                (statusChange)="onStatusChange($event)"
                (reorder)="onReorder($event)">
              </app-task-list>
            </div>

            <!-- In Progress Column -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">In Progress</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {{ (tasksByStatus$ | async)?.inProgress?.length || 0 }}
                </span>
              </div>
              <app-task-list
                [tasks]="(tasksByStatus$ | async)?.inProgress || []"
                [currentUser]="currentUser$ | async"
                status="in-progress"
                (editTask)="onEditTask($event)"
                (deleteTask)="onDeleteTask($event)"
                (statusChange)="onStatusChange($event)"
                (reorder)="onReorder($event)">
              </app-task-list>
            </div>

            <!-- Done Column -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Done</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  {{ (tasksByStatus$ | async)?.done?.length || 0 }}
                </span>
              </div>
              <app-task-list
                [tasks]="(tasksByStatus$ | async)?.done || []"
                [currentUser]="currentUser$ | async"
                status="done"
                (editTask)="onEditTask($event)"
                (deleteTask)="onDeleteTask($event)"
                (statusChange)="onStatusChange($event)"
                (reorder)="onReorder($event)">
              </app-task-list>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  sortedTasks$: Observable<Task[]>;
  tasksByStatus$: Observable<{
    backlog: Task[];
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  }>;
  tasksLoading$: Observable<boolean>;
  currentFilter$: Observable<string>;
  taskCategories$: Observable<string[]>;

  showTaskForm = false;
  editingTask: Task | null = null;

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.sortedTasks$ = this.store.select(selectSortedTasks);
    this.tasksByStatus$ = this.store.select(selectTasksByStatus);
    this.tasksLoading$ = this.store.select(selectTasksLoading);
    this.currentFilter$ = this.store.select(selectTaskFilter);
    this.taskCategories$ = this.store.select(selectTaskCategories);
  }

  ngOnInit() {
    // Only load tasks if user is authenticated
    this.currentUser$.subscribe(user => {
      if (user) {
        this.store.dispatch(TaskActions.loadTasks());
      }
    });
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }

  onFilterChange(event: any) {
    this.store.dispatch(TaskActions.setFilter({ filter: event.target.value }));
  }

  onSortChange(event: any) {
    this.store.dispatch(TaskActions.setSortBy({ sortBy: event.target.value }));
  }

  onTaskSave(taskData: any) {
    if (this.editingTask) {
      this.store.dispatch(TaskActions.updateTask({ 
        id: this.editingTask.id, 
        taskData 
      }));
    } else {
      // Get current user and add organizationId to task data
      this.currentUser$.pipe(take(1)).subscribe(user => {
        if (user && user.organizationId) {
          const taskDataWithOrg = {
            ...taskData,
            organizationId: user.organizationId
          };
          this.store.dispatch(TaskActions.createTask({ taskData: taskDataWithOrg }));
        } else {
          console.error('User or organizationId not available');
        }
      });
    }
    this.onTaskFormCancel();
  }

  onTaskFormCancel() {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  onEditTask(task: Task) {
    this.editingTask = task;
    this.showTaskForm = true;
  }

  onDeleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TaskActions.deleteTask({ id: taskId }));
    }
  }

  onStatusChange(event: { taskId: string; status: TaskStatus }) {
    this.store.dispatch(TaskActions.updateTaskStatus({ 
      id: event.taskId, 
      status: event.status 
    }));
  }

  onReorder(taskIds: string[]) {
    this.store.dispatch(TaskActions.reorderTasks({ taskIds }));
  }

  toggleTheme() {
    document.documentElement.classList.toggle('dark');
  }
}
