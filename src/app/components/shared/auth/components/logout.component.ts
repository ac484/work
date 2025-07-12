import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-logout',
  template: `
    <button pButton type="button" label="登出" (click)="logout()" [disabled]="loading"></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ButtonModule],
})
export class LogoutComponent {
  private auth = inject(AuthService);
  loading = false;
  async logout(): Promise<void> {
    this.loading = true;
    await this.auth.logout();
    this.loading = false;
  }
} 