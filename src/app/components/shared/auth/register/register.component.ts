import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  email: string = '';
  password: string = '';
  error: string = '';

  async register(): Promise<void> {
    try {
      await this.auth.registerWithEmail(this.email, this.password);
    } catch (e) {
      this.error = '註冊失敗';
    }
  }
} 