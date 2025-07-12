import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  email = '';
  password = '';
  error = '';

  async register(): Promise<void> {
    this.error = '';
    try {
      await this.auth.registerWithEmail(this.email, this.password);
    } catch {
      this.error = '註冊失敗，請檢查資料';
    }
  }
} 