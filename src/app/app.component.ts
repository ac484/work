import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from './components/app.footer';
import { GoogleAuthService } from './components/shared/auth/google-auth.service';
import { GoogleAuthButtonComponent } from './components/shared/auth/google-auth-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, GoogleAuthButtonComponent, AsyncPipe],
  template: `
    <div class="app-root-layout">
      <app-topbar></app-topbar>
      <div class="flex-1">
        <app-google-auth-button
          [isLoggedIn]="!!(user$ | async)"
          [userName]="(user$ | async)?.displayName || ''"
          (login)="onLogin()"
          (logout)="onLogout()"
        ></app-google-auth-button>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `.app-root-layout { min-height: 100vh; display: flex; flex-direction: column; }`,
    `.flex-1 { flex: 1 1 auto; }`
  ],
  standalone: true
})
export class AppComponent {
  user$;
  constructor(public auth: GoogleAuthService) {
    this.user$ = this.auth.user$;
  }
  onLogin() { this.auth.loginWithGoogle(); }
  onLogout() { this.auth.logout(); }
}
