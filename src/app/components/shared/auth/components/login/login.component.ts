import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  private auth = inject(AuthService);
  email: string = '';
  password: string = '';
  error: string = '';

  async loginWithEmail(): Promise<void> {
    try {
      await this.auth.loginWithEmail(this.email, this.password);
    } catch (e) {
      this.error = '登入失敗';
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await this.auth.loginWithGoogle();
    } catch (e) {
      this.error = 'Google 登入失敗';
    }
  }
} 