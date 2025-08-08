import { createReducer, on } from '@ngrx/store';
import { User, Organization } from '../shared/models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  currentWorkingOrganization: Organization | null;
  accessibleOrganizations: Organization[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  currentWorkingOrganization: null,
  accessibleOrganizations: [],
  isLoading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoading: false,
    error: null
  })),
  
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoading: false,
    error: null
  })),
  
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Logout
  on(AuthActions.logout, AuthActions.logoutSuccess, () => ({
    ...initialState
  })),
  
  // Load Profile
  on(AuthActions.loadProfile, (state) => ({
    ...state,
    isLoading: true
  })),
  
  on(AuthActions.loadProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null
  })),
  
  on(AuthActions.loadProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Initialize Auth
  on(AuthActions.initializeAuth, (state) => ({
    ...state,
    isLoading: true
  })),

  on(AuthActions.initializeAuthSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isLoading: false,
    error: null
  })),

  on(AuthActions.initializeAuthFailure, (state) => ({
    ...state,
    isLoading: false
  })),

  // Organization Actions
  on(AuthActions.loadAccessibleOrganizations, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loadAccessibleOrganizationsSuccess, (state, { organizations }) => ({
    ...state,
    accessibleOrganizations: organizations,
    currentWorkingOrganization: state.currentWorkingOrganization || 
      (state.user?.organization ? state.user.organization : organizations[0] || null),
    isLoading: false,
    error: null
  })),

  on(AuthActions.loadAccessibleOrganizationsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(AuthActions.setCurrentWorkingOrganization, (state, { organization }) => ({
    ...state,
    currentWorkingOrganization: organization
  }))
);
