import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AuthActions from '../store/auth.actions';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/selectors';
import { UserRole } from '../shared/models';

interface Organization {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or
            <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              sign in to your existing account
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  formControlName="firstName"
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="First name"
                />
              </div>
              
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  formControlName="lastName"
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                formControlName="email"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                   class="mt-1 text-sm text-red-600 dark:text-red-400">
                Please enter a valid email address
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  formControlName="password"
                  class="mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 top-1 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
              </div>
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                   class="mt-1 text-sm text-red-600 dark:text-red-400">
                Password must be at least 6 characters
              </div>
            </div>
            
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                id="role"
                name="role"
                formControlName="role"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            
            <div>
              <label for="organizationId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization
              </label>
              <select
                id="organizationId"
                name="organizationId"
                formControlName="organizationId"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="">Select an organization</option>
                <option *ngFor="let org of organizations" [value]="org.id">
                  {{ org.name }} {{ org.parentId ? '(Branch)' : '(HQ)' }}
                </option>
              </select>
              <div *ngIf="registerForm.get('organizationId')?.invalid && registerForm.get('organizationId')?.touched" 
                   class="mt-1 text-sm text-red-600 dark:text-red-400">
                Please select an organization
              </div>
            </div>
          </div>

          <div *ngIf="error$ | async" class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            {{ error$ | async }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || (isLoading$ | async)"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="isLoading$ | async" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ (isLoading$ | async) ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  isAuthenticated$: Observable<boolean>;
  showPassword = false;
  organizations: Organization[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.VIEWER, [Validators.required]],
      organizationId: ['', [Validators.required]]
    });

    this.isLoading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit() {
    // Load organizations
    this.loadOrganizations();
    
    // Redirect if already authenticated
    this.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private loadOrganizations() {
    // For now, hardcode the organizations since we don't have an API endpoint
    // In a real app, you'd fetch this from an API
    this.organizations = [
      {
        id: 'efec00b3-f977-47d2-bfc7-dc630355938f',
        name: 'Dallas, TX',
        description: 'Head Office',
        parentId: null
      },
      {
        id: '4f9fa1c8-4cab-4297-9564-33fb19d0dde0',
        name: 'GTA',
        description: 'Downtown Toronto Office',
        parentId: 'efec00b3-f977-47d2-bfc7-dc630355938f'
      },
      {
        id: '3c2988b9-5c7c-441a-9571-85f387fd26bb',
        name: 'Remote',
        description: 'Remote workers',
        parentId: 'efec00b3-f977-47d2-bfc7-dc630355938f'
      }
    ];
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.store.dispatch(AuthActions.register({ 
        userData: this.registerForm.value 
      }));
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
