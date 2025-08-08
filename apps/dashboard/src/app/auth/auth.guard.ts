import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated, selectAuthLoading } from '../store/selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    // Wait for auth initialization to complete, then check if authenticated
    return combineLatest([
      this.store.select(selectAuthLoading),
      this.store.select(selectIsAuthenticated)
    ]).pipe(
      filter(([loading]) => !loading), // Wait until not loading
      take(1), // Take only the first emission after loading completes
      map(([_, isAuthenticated]) => {
        if (isAuthenticated) {
          return true;
        }
        
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
