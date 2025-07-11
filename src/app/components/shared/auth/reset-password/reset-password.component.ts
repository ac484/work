import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
})
export class ResetPasswordComponent {
  private auth = inject(AuthService);
  email: string = '';
  message: string = '';
  error: string = '';

  async reset(): Promise<void> {
    try {
      await this.auth.resetPassword(this.email);
      this.message = '重設密碼信已寄出';
    } catch (e) {
      this.error = '重設失敗';
    }
  }
} 