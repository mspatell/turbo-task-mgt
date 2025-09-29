import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest, Organization } from '@turbo-vets/data';

// Auth Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{ userData: RegisterRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const loadProfile = createAction('[Auth] Load Profile');

export const loadProfileSuccess = createAction(
  '[Auth] Load Profile Success',
  props<{ user: User }>()
);

export const loadProfileFailure = createAction(
  '[Auth] Load Profile Failure',
  props<{ error: string }>()
);

// Initialize auth state from stored token
export const initializeAuth = createAction('[Auth] Initialize Auth');

export const initializeAuthSuccess = createAction(
  '[Auth] Initialize Auth Success',
  props<{ user: User; token: string }>()
);

export const initializeAuthFailure = createAction(
  '[Auth] Initialize Auth Failure'
);

// Organization Actions
export const loadAccessibleOrganizations = createAction(
  '[Auth] Load Accessible Organizations'
);

export const loadAccessibleOrganizationsSuccess = createAction(
  '[Auth] Load Accessible Organizations Success',
  props<{ organizations: Organization[] }>()
);

export const loadAccessibleOrganizationsFailure = createAction(
  '[Auth] Load Accessible Organizations Failure',
  props<{ error: string }>()
);

export const setCurrentWorkingOrganization = createAction(
  '[Auth] Set Current Working Organization',
  props<{ organization: Organization }>()
);
