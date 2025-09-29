import { createReducer, on } from '@ngrx/store';
import { Task } from '@turbo-vets/data';
import * as TaskActions from './task.actions';

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: string;
  sortBy: string;
}

export const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  filter: 'all',
  sortBy: 'createdAt'
};

export const taskReducer = createReducer(
  initialState,
  
  // Load Tasks
  on(TaskActions.loadTasks, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Create Task
  on(TaskActions.createTask, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.createTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Update Task
  on(TaskActions.updateTask, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t.id === task.id ? task : t),
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Delete Task
  on(TaskActions.deleteTask, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== id),
    isLoading: false,
    error: null
  })),
  
  on(TaskActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Update Task Status
  on(TaskActions.updateTaskStatus, (state, { id, status }) => ({
    ...state,
    tasks: state.tasks.map(t => 
      t.id === id ? { ...t, status } : t
    )
  })),
  
  // Reorder Tasks
  on(TaskActions.reorderTasksSuccess, (state, { taskIds }) => {
    const taskMap = new Map(state.tasks.map(task => [task.id, task]));
    const reorderedTasks = taskIds.map(id => taskMap.get(id)).filter((task): task is Task => task !== undefined);
    return {
      ...state,
      tasks: reorderedTasks
    };
  }),
  
  // Filter and Sort
  on(TaskActions.setFilter, (state, { filter }) => ({
    ...state,
    filter
  })),
  
  on(TaskActions.setSortBy, (state, { sortBy }) => ({
    ...state,
    sortBy
  }))
);
