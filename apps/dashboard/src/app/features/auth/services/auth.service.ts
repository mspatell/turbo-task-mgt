import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '@turbo-vets/data';
import * as AuthActions from '../../../store/auth/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3003/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private store = inject(Store);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize token subject from localStorage, but don't dispatch to store here
    // Store initialization will be handled by the app component
    const token = this.getStoredToken();
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/profile`, userData);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  clearAuth(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }
}
