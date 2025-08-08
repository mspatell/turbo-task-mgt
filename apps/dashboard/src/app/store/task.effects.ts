import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { TaskService } from '../tasks/task.service';
import * as TaskActions from './task.actions';

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions);
  private taskService = inject(TaskService);
  
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      exhaustMap(() => 
        this.taskService.getTasks().pipe(
          map(tasks => TaskActions.loadTasksSuccess({ tasks })),
          catchError(error => of(TaskActions.loadTasksFailure({ 
            error: error.error?.message || 'Failed to load tasks' 
          })))
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      exhaustMap(action =>
        this.taskService.createTask(action.taskData).pipe(
          map(task => TaskActions.createTaskSuccess({ task })),
          catchError(error => of(TaskActions.createTaskFailure({ 
            error: error.error?.message || 'Failed to create task' 
          })))
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      exhaustMap(action =>
        this.taskService.updateTask(action.id, action.taskData).pipe(
          map(task => TaskActions.updateTaskSuccess({ task })),
          catchError(error => of(TaskActions.updateTaskFailure({ 
            error: error.error?.message || 'Failed to update task' 
          })))
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      exhaustMap(action =>
        this.taskService.deleteTask(action.id).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id: action.id })),
          catchError(error => of(TaskActions.deleteTaskFailure({ 
            error: error.error?.message || 'Failed to delete task' 
          })))
        )
      )
    )
  );

  updateTaskStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTaskStatus),
      exhaustMap(action =>
        this.taskService.updateTaskStatus(action.id, action.status).pipe(
          map(task => TaskActions.updateTaskSuccess({ task })),
          catchError(error => of(TaskActions.updateTaskFailure({ 
            error: error.error?.message || 'Failed to update task status' 
          })))
        )
      )
    )
  );

  reorderTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.reorderTasks),
      exhaustMap(action =>
        this.taskService.reorderTasks(action.taskIds).pipe(
          map(() => TaskActions.reorderTasksSuccess({ taskIds: action.taskIds })),
          catchError(() => of(TaskActions.loadTasks()))
        )
      )
    )
  );
}
