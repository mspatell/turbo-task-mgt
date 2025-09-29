import { Route } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth.guard';
import { AdminGuard } from './features/auth/guards/admin.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'audit',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./features/audit/components/audit-log.component').then(m => m.AuditLogComponent)
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
