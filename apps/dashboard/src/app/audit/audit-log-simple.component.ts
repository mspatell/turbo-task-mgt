import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { HeaderComponent } from '../shared/header.component';
import { selectCurrentUser } from '../store/selectors';
import { 
  AuditLog, 
  AuditLogsResponse, 
  User
} from '../shared/models';

@Component({
  selector: 'app-audit-log',
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <app-header 
        [user]="currentUser$ | async"
        (logout)="onLogout()">
      </app-header>

      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <!-- Header Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Audit Log
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Monitor and track all system activities and user actions
          </p>
        </div>

        <!-- Summary Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Audit Entries
                <span *ngIf="auditData" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({{ auditData.total || 0 }} total)
                </span>
              </h2>
            </div>
            
            <button (click)="loadAuditLogs()" 
                    [disabled]="loading"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              <span *ngIf="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
              <span *ngIf="!loading">Refresh</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading && !auditData" class="text-center py-12">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-lg text-gray-900 dark:text-white">Loading audit data...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="text-center py-12">
          <div class="text-red-600 dark:text-red-400">
            <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <p class="text-lg font-medium">Error loading audit data</p>
            <p class="text-sm mt-1">{{ error }}</p>
            <button (click)="loadAuditLogs()" 
                    class="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
              Try Again
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && auditData && auditData.auditLogs.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg font-medium text-gray-900 dark:text-white">No audit logs found</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">System activities will appear here</p>
        </div>

        <!-- Audit Log Table -->
        <div *ngIf="!loading && !error && auditData && auditData.auditLogs.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Resource
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let log of auditData.auditLogs" 
                    class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ log.createdAt | date:'medium' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div *ngIf="log.user" class="text-sm">
                      <div class="font-medium text-gray-900 dark:text-white">
                        {{ log.user.firstName }} {{ log.user.lastName }}
                      </div>
                      <div class="text-gray-500 dark:text-gray-400">
                        {{ log.user.email }}
                      </div>
                    </div>
                    <div *ngIf="!log.user" class="text-sm text-gray-500 dark:text-gray-400">
                      System
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="getActionBadgeClass(log.action)" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ formatAction(log.action) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="getResourceBadgeClass(log.resource)" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ formatResource(log.resource) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {{ log.details || 'No details available' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ log.ipAddress }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class AuditLogComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  auditData: AuditLogsResponse | null = null;
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private auditService: AuditService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    this.loadAuditLogs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAuditLogs() {
    this.loading = true;
    this.error = null;

    this.auditService.getAuditLogs({ limit: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.auditData = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading audit logs:', error);
          this.error = error.error?.message || 'Failed to load audit logs';
          this.loading = false;
        }
      });
  }

  onLogout() {
    this.store.dispatch({ type: '[Auth] Logout' });
  }

  // Helper methods for formatting
  formatAction(action: string): string {
    return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
  }

  formatResource(resource: string): string {
    return resource.charAt(0).toUpperCase() + resource.slice(1);
  }

  // Helper methods for styling
  getActionBadgeClass(action: string): string {
    const baseClasses = 'text-xs font-semibold rounded-full px-2 py-1';
    switch (action) {
      case 'create':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
      case 'update':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      case 'delete':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
      case 'login':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300`;
      case 'logout':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300`;
      case 'access_denied':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300`;
    }
  }

  getResourceBadgeClass(resource: string): string {
    const baseClasses = 'text-xs font-semibold rounded-full px-2 py-1';
    switch (resource) {
      case 'task':
        return `${baseClasses} bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300`;
      case 'user':
        return `${baseClasses} bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300`;
      case 'organization':
        return `${baseClasses} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300`;
      case 'auth':
        return `${baseClasses} bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300`;
    }
  }
}
