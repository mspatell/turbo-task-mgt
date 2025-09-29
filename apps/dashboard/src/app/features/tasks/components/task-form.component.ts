import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task, TaskCategory, TaskPriority, CreateTaskRequest, UpdateTaskRequest } from '@turbo-vets/data';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ task ? 'Edit Task' : 'Create New Task' }}
        </h3>
        <button
          (click)="cancel.emit()"
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            formControlName="title"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter task title"
          />
          <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" 
               class="mt-1 text-sm text-red-600 dark:text-red-400">
            Title is required
          </div>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows="3"
            formControlName="description"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="category"
              formControlName="category"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              id="priority"
              formControlName="priority"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date (Optional)
            </label>
            <input
              id="dueDate"
              type="date"
              formControlName="dueDate"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            (click)="cancel.emit()"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="taskForm.invalid"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ task ? 'Update Task' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<CreateTaskRequest | UpdateTaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [TaskCategory.WORK, Validators.required],
      priority: [TaskPriority.MEDIUM, Validators.required],
      dueDate: ['']
    });
  }

  ngOnInit() {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        category: this.task.category,
        priority: this.task.priority,
        dueDate: this.task.dueDate ? new Date(this.task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData = {
        ...formValue,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined
      };
      this.save.emit(taskData);
    }
  }
}
