import { Route } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./tasks/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'audit',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./audit/audit-log.component').then(m => m.AuditLogComponent)
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
