import { createAction, props } from '@ngrx/store';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../shared/models';

// Task Actions
export const loadTasks = createAction('[Task] Load Tasks');

export const loadTasksSuccess = createAction(
  '[Task] Load Tasks Success',
  props<{ tasks: Task[] }>()
);

export const loadTasksFailure = createAction(
  '[Task] Load Tasks Failure',
  props<{ error: string }>()
);

export const createTask = createAction(
  '[Task] Create Task',
  props<{ taskData: CreateTaskRequest }>()
);

export const createTaskSuccess = createAction(
  '[Task] Create Task Success',
  props<{ task: Task }>()
);

export const createTaskFailure = createAction(
  '[Task] Create Task Failure',
  props<{ error: string }>()
);

export const updateTask = createAction(
  '[Task] Update Task',
  props<{ id: string; taskData: UpdateTaskRequest }>()
);

export const updateTaskSuccess = createAction(
  '[Task] Update Task Success',
  props<{ task: Task }>()
);

export const updateTaskFailure = createAction(
  '[Task] Update Task Failure',
  props<{ error: string }>()
);

export const deleteTask = createAction(
  '[Task] Delete Task',
  props<{ id: string }>()
);

export const deleteTaskSuccess = createAction(
  '[Task] Delete Task Success',
  props<{ id: string }>()
);

export const deleteTaskFailure = createAction(
  '[Task] Delete Task Failure',
  props<{ error: string }>()
);

export const updateTaskStatus = createAction(
  '[Task] Update Task Status',
  props<{ id: string; status: TaskStatus }>()
);

export const reorderTasks = createAction(
  '[Task] Reorder Tasks',
  props<{ taskIds: string[] }>()
);

export const reorderTasksSuccess = createAction(
  '[Task] Reorder Tasks Success',
  props<{ taskIds: string[] }>()
);

export const setFilter = createAction(
  '[Task] Set Filter',
  props<{ filter: string }>()
);

export const setSortBy = createAction(
  '[Task] Set Sort By',
  props<{ sortBy: string }>()
);
