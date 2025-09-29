import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import { HeaderComponent } from '../../../layout/header/header.component';
import { selectCurrentUser } from '../../../store/selectors';
import { 
  AuditLog, 
  AuditLogsResponse, 
  User
} from '@turbo-vets/data';

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
                Audit Log Downloads
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Export audit data for analysis and compliance reporting
              </p>
            </div>
          </div>
        </div>

        <!-- Download Buttons -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Download Full Audit Logs -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Full Audit Logs</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Complete audit trail with all recorded activities</p>
              </div>
            </div>
            <button (click)="downloadAuditLogs()" 
                    [disabled]="downloading"
                    class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="downloading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </span>
              <span *ngIf="!downloading" class="inline-flex items-center">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download CSV
              </span>
            </button>
          </div>

          <!-- Download Audit Summary -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Audit Summary</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Statistical overview and recent activity summary</p>
              </div>
            </div>
            <button (click)="downloadAuditSummary()" 
                    [disabled]="downloading"
                    class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="downloading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </span>
              <span *ngIf="!downloading" class="inline-flex items-center">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download CSV
              </span>
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="downloadSuccess" class="mt-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800 dark:text-green-200">
                {{ downloadSuccess }}
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="mt-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class AuditLogComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  downloading = false;
  downloadSuccess: string | null = null;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private auditService: AuditService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    // No need to load logs on init since we're only downloading
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  downloadAuditLogs() {
    this.downloading = true;
    this.error = null;
    this.downloadSuccess = null;

    this.auditService.downloadAuditLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const timestamp = new Date().toISOString().split('T')[0];
          this.downloadFile(blob, `audit-logs-${timestamp}.csv`);
          this.downloadSuccess = 'Audit logs downloaded successfully!';
          this.downloading = false;
          this.clearMessages();
        },
        error: (error) => {
          console.error('Error downloading audit logs:', error);
          this.error = error.error?.message || 'Failed to download audit logs';
          this.downloading = false;
          this.clearMessages();
        }
      });
  }

  downloadAuditSummary() {
    this.downloading = true;
    this.error = null;
    this.downloadSuccess = null;

    this.auditService.downloadAuditSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const timestamp = new Date().toISOString().split('T')[0];
          this.downloadFile(blob, `audit-summary-${timestamp}.csv`);
          this.downloadSuccess = 'Audit summary downloaded successfully!';
          this.downloading = false;
          this.clearMessages();
        },
        error: (error) => {
          console.error('Error downloading audit summary:', error);
          this.error = error.error?.message || 'Failed to download audit summary';
          this.downloading = false;
          this.clearMessages();
        }
      });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private clearMessages(): void {
    setTimeout(() => {
      this.downloadSuccess = null;
      this.error = null;
    }, 5000);
  }

  onLogout() {
    this.store.dispatch({ type: '[Auth] Logout' });
  }
}
