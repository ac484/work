import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, MessageModule],
})
export class ResetPasswordComponent {
  private auth = inject(AuthService);
  email = '';
  message = '';
  error = '';

  async reset(): Promise<void> {
    this.message = '';
    this.error = '';
    try {
      await this.auth.resetPassword(this.email);
      this.message = '重設密碼信已寄出';
    } catch {
      this.error = '重設失敗，請檢查 Email';
    }
  }
} 