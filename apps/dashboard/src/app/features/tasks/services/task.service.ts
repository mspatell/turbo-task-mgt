import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  TaskStatus
} from '@turbo-vets/data';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3003/api/tasks';
  private http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<{ tasks: Task[]; total: number }>(this.apiUrl).pipe(
      map(response => response.tasks)
    );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, taskData);
  }

  updateTask(id: string, taskData: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, taskData);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.updateTask(id, { status });
  }

  reorderTasks(taskIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, { taskIds });
  }
}
