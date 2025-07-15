// 本元件為 Google 與信箱登入按鈕
// 功能：支援 Google 登入、信箱登入/註冊/重設密碼、登出
// 用途：側邊欄與登入區塊的認證操作元件
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-google-auth-button',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './google-auth-button.component.html',
  styleUrls: ['./google-auth-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoogleAuthButtonComponent {
  @Input() isLoggedIn = false;
  @Input() userName = '';
  @Input() loading = false;
  @Input() iconOnly = false;
  @Output() loginGoogle = new EventEmitter<void>();
  @Output() loginEmail = new EventEmitter<{ email: string; password: string }>();
  @Output() registerEmail = new EventEmitter<{ email: string; password: string }>();
  @Output() changePassword = new EventEmitter<{ email: string }>();
  @Output() logout = new EventEmitter<void>();

  email = '';
  password = '';
  mode: 'login' | 'register' | 'reset' = 'login';

  submit() {
    if (this.mode === 'login') {
      this.loginEmail.emit({ email: this.email, password: this.password });
    } else if (this.mode === 'register') {
      this.registerEmail.emit({ email: this.email, password: this.password });
    } else if (this.mode === 'reset') {
      this.changePassword.emit({ email: this.email });
    }
  }
  switchMode(next: 'login' | 'register' | 'reset') {
    this.mode = next;
  }
} 