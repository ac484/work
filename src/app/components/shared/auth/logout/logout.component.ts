import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  template: '<button (click)="logout()">登出</button>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {
  private auth = inject(AuthService);
  async logout(): Promise<void> {
    await this.auth.logout();
  }
} 