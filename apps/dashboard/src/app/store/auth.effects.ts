import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { OrganizationService } from '../services/organization.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(action =>
        this.authService.login(action.credentials).pipe(
          map(response => AuthActions.loginSuccess({ 
            user: response.user, 
            token: response.access_token 
          })),
          catchError(error => of(AuthActions.loginFailure({ 
            error: error.error?.message || 'Login failed' 
          })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(action =>
        this.authService.register(action.userData).pipe(
          map(response => AuthActions.registerSuccess({ 
            user: response.user, 
            token: response.access_token 
          })),
          catchError(error => of(AuthActions.registerFailure({ 
            error: error.error?.message || 'Registration failed' 
          })))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    )
  );

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      exhaustMap(() =>
        this.authService.getProfile().pipe(
          map(user => AuthActions.loadProfileSuccess({ user })),
          catchError(error => of(AuthActions.loadProfileFailure({ 
            error: error.error?.message || 'Failed to load profile' 
          })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(({ user, token }) => {
        // Update AuthService state
        this.authService.setToken(token);
        this.authService.setCurrentUser(user);
        this.router.navigate(['/dashboard']);
      })
    ),
    { dispatch: false }
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        // Clear AuthService state
        this.authService.clearAuth();
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );

  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuth),
      exhaustMap(() => {
        const token = this.authService.getStoredToken();
        if (token) {
          // Token exists, verify it by loading the user profile
          return this.authService.getProfile().pipe(
            map(user => AuthActions.initializeAuthSuccess({ user, token })),
            catchError(() => {
              // Token is invalid, clear it
              this.authService.clearAuth();
              return of(AuthActions.initializeAuthFailure());
            })
          );
        } else {
          // No token found
          return of(AuthActions.initializeAuthFailure());
        }
      })
    )
  );

  initializeAuthSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initializeAuthSuccess),
      tap(({ user, token }) => {
        // Update AuthService state
        this.authService.setToken(token);
        this.authService.setCurrentUser(user);
      })
    ),
    { dispatch: false }
  );

  loadAccessibleOrganizations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadAccessibleOrganizations),
      exhaustMap(() =>
        this.organizationService.getAccessibleOrganizations().pipe(
          map(organizations => AuthActions.loadAccessibleOrganizationsSuccess({ organizations })),
          catchError(error => of(AuthActions.loadAccessibleOrganizationsFailure({ 
            error: error.error?.message || 'Failed to load organizations' 
          })))
        )
      )
    )
  );
}
