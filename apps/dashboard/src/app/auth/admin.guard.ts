import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectCurrentUser } from '../store/selectors';
import { UserRole } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectCurrentUser).pipe(
      map(user => {
        if (user && (user.role === UserRole.OWNER || user.role === UserRole.ADMIN)) {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}
