import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);
  email = '';
  password = '';
  error = '';

  async loginWithEmail(): Promise<void> {
    this.error = '';
    try {
      await this.auth.loginWithEmail(this.email, this.password);
    } catch {
      this.error = '登入失敗，請檢查帳號密碼';
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.error = '';
    try {
      await this.auth.loginWithGoogle();
    } catch {
      this.error = 'Google 登入失敗';
    }
  }
}
