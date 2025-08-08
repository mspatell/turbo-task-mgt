import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User, UserRole } from './models';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-8">
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ user?.organization?.name || organizationName }}</h1>
            </div>
            
            <!-- Navigation Links -->
            <nav class="hidden md:flex space-x-6">
              <a routerLink="/dashboard" 
                 routerLinkActive="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                 class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors">
                Dashboard
              </a>
              
              <a *ngIf="isAdminUser()" 
                 routerLink="/audit" 
                 routerLinkActive="text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                 class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Audit Log
                </div>
              </a>
            </nav>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Mobile Navigation -->
            <div class="md:hidden">
              <button (click)="toggleMobileMenu()" 
                      class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <!-- Theme Toggle -->
            <button
              (click)="toggleTheme.emit()"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- User Menu -->
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ (user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '') }}
                  </span>
                </div>
              </div>
              <div class="hidden md:block">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ user?.firstName }} {{ user?.lastName }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ user?.email }}
                </div>
                <div class="text-xs text-blue-600 dark:text-blue-400 capitalize">
                  {{ user?.role }}
                </div>
              </div>
              <button
                (click)="logout.emit()"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div *ngIf="showMobileMenu" class="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-4">
          <div class="space-y-2">
            <a routerLink="/dashboard" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
               class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
              Dashboard
            </a>
            
            <a *ngIf="isAdminUser()" 
               routerLink="/audit" 
               (click)="closeMobileMenu()"
               routerLinkActive="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
               class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Audit Log
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  @Input() user: User | null = null;
  @Input() organizationName: string = '';
  @Output() logout = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();

  showMobileMenu = false;

  isAdminUser(): boolean {
    return this.user?.role === UserRole.OWNER || this.user?.role === UserRole.ADMIN;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}
