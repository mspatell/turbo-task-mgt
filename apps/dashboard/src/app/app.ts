import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/auth/auth.actions';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'dashboard';
  private store = inject(Store);

  ngOnInit() {
    // Initialize auth state from stored token
    this.store.dispatch(AuthActions.initializeAuth());
  }
}
