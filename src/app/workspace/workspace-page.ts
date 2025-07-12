import { Component, signal } from '@angular/core';
import { GoogleAuthButtonComponent } from '../shared/components/google-auth/google-auth-button.component';
import { GoogleAuthService } from '../shared/components/google-auth/google-auth.service';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [CommonModule, GoogleAuthButtonComponent],
  templateUrl: './workspace-page.html',
  styleUrl: './workspace-page.scss'
})
export class WorkspacePage {
  loading = signal(false);
  readonly user;

  constructor(private auth: GoogleAuthService) {
    this.user = toSignal(this.auth.user$, { initialValue: null });
  }

  onLogin() {
    this.loading.set(true);
    this.auth.loginWithGoogle().finally(() => this.loading.set(false));
  }

  onLogout() {
    this.loading.set(true);
    this.auth.logout().finally(() => this.loading.set(false));
  }
}
