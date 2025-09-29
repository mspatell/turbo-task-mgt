import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth/auth.reducer';
import { TaskState } from './tasks/task.reducer';
import { TaskStatus } from '@turbo-vets/data';

// Auth Selectors
export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => !!state.user && !!state.token
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectCurrentWorkingOrganization = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentWorkingOrganization
);

export const selectAccessibleOrganizations = createSelector(
  selectAuthState,
  (state: AuthState) => state.accessibleOrganizations
);

// Task Selectors
export const selectTaskState = createFeatureSelector<TaskState>('tasks');

export const selectAllTasks = createSelector(
  selectTaskState,
  (state: TaskState) => {
    // Ensure we always return an array
    return Array.isArray(state?.tasks) ? state.tasks : [];
  }
);

export const selectTasksLoading = createSelector(
  selectTaskState,
  (state: TaskState) => state.isLoading
);

export const selectTasksError = createSelector(
  selectTaskState,
  (state: TaskState) => state.error
);

export const selectTaskFilter = createSelector(
  selectTaskState,
  (state: TaskState) => state.filter
);

export const selectTaskSortBy = createSelector(
  selectTaskState,
  (state: TaskState) => state.sortBy
);

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectTaskFilter,
  (tasks, filter) => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    if (filter === 'all') return taskArray;
    if (filter === 'backlog') return taskArray.filter(task => task && task.status === TaskStatus.BACKLOG);
    if (filter === 'todo') return taskArray.filter(task => task && task.status === TaskStatus.TODO);
    if (filter === 'in-progress') return taskArray.filter(task => task && task.status === TaskStatus.IN_PROGRESS);
    if (filter === 'done') return taskArray.filter(task => task && task.status === TaskStatus.DONE);
    
    // Filter by category
    return taskArray.filter(task => task && task.category === filter);
  }
);

export const selectSortedTasks = createSelector(
  selectFilteredTasks,
  selectTaskSortBy,
  (tasks, sortBy) => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const sortedTasks = [...taskArray];
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    
    switch (sortBy) {
      case 'title':
        return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
      case 'dueDate':
        return sortedTasks.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      case 'priority':
        return sortedTasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
      case 'createdAt':
      default:
        return sortedTasks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }
);

export const selectTasksByStatus = createSelector(
  selectAllTasks,
  (tasks) => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    
    const result = {
      backlog: taskArray.filter(task => task && task.status === TaskStatus.BACKLOG),
      todo: taskArray.filter(task => task && task.status === TaskStatus.TODO),
      inProgress: taskArray.filter(task => task && task.status === TaskStatus.IN_PROGRESS),
      done: taskArray.filter(task => task && task.status === TaskStatus.DONE)
    };
    
    return result;
  }
);

export const selectTaskCategories = createSelector(
  selectAllTasks,
  (tasks) => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const categories = new Set(taskArray.filter(task => task && task.category).map(task => task.category as string));
    return Array.from(categories);
  }
);
