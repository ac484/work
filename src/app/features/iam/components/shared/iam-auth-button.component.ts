// IAM 認證按鈕組件 - 替代 Google Auth 按鈕
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';

@Component({
  selector: 'app-iam-auth-button',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <!-- 未登入狀態 -->
    <div *ngIf="!isLoggedIn" class="auth-container">
      <!-- Google 登入按鈕 -->
      <p-button 
        icon="pi pi-google" 
        [label]="iconOnly ? '' : 'Google 登入'"
        severity="info"
        [outlined]="true"
        class="w-full mb-2"
        [loading]="loading"
        [disabled]="loading"
        (onClick)="onGoogleLogin()">
      </p-button>

      <!-- 電子郵件登入表單 -->
      <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="auth-form">
        <input 
          pInputText 
          type="email" 
          formControlName="email"
          placeholder="電子郵件" 
          class="w-full mb-2"
          [disabled]="loading">
        
        <input 
          *ngIf="mode !== 'reset'"
          pInputText 
          type="password" 
          formControlName="password"
          placeholder="密碼" 
          class="w-full mb-2"
          [disabled]="loading">

        <p-button 
          type="submit"
          [label]="getSubmitLabel()"
          icon="pi pi-envelope"
          class="w-full mb-2"
          [loading]="loading"
          [disabled]="authForm.invalid || loading">
        </p-button>

        <!-- 模式切換連結 -->
        <div class="flex justify-content-between text-xs">
          <a 
            href="#" 
            class="text-blue-500 no-underline"
            (click)="switchMode(mode === 'login' ? 'register' : 'login'); $event.preventDefault()">
            {{ mode === 'login' ? '註冊' : '登入' }}
          </a>
          <a 
            *ngIf="mode !== 'reset'"
            href="#" 
            class="text-blue-500 no-underline"
            (click)="switchMode('reset'); $event.preventDefault()">
            忘記密碼
          </a>
          <a 
            *ngIf="mode === 'reset'"
            href="#" 
            class="text-blue-500 no-underline"
            (click)="switchMode('login'); $event.preventDefault()">
            返回登入
          </a>
        </div>
      </form>

      <!-- 錯誤訊息 -->
      <p-message 
        *ngIf="errorMessage" 
        severity="error" 
        [text]="errorMessage"
        class="w-full mt-2">
      </p-message>
    </div>

    <!-- 已登入狀態 -->
    <div *ngIf="isLoggedIn" class="logged-in-container">
      <p-button 
        icon="pi pi-sign-out" 
        [label]="iconOnly ? '' : (userName + ' 登出')"
        severity="secondary"
        [outlined]="true"
        class="w-full"
        [loading]="loading"
        [disabled]="loading"
        (onClick)="onLogout()">
      </p-button>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }
    
    .auth-form {
      width: 100%;
    }
    
    .logged-in-container {
      width: 100%;
    }
    
    .text-xs {
      font-size: 0.75rem;
    }
  `]
})
export class IamAuthButtonComponent {
  @Input() isLoggedIn = false;
  @Input() userName = '';
  @Input() loading = false;
  @Input() iconOnly = false;

  private fb = inject(FormBuilder);
  private iamFacade = inject(IamFacadeService);

  authForm: FormGroup;
  mode: 'login' | 'register' | 'reset' = 'login';
  errorMessage = '';

  constructor() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onGoogleLogin(): Promise<void> {
    try {
      this.errorMessage = '';
      await this.iamFacade.loginWithGoogle();
    } catch (error: any) {
      this.errorMessage = error.message || 'Google 登入失敗';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.valid) {
      try {
        this.errorMessage = '';
        const { email, password } = this.authForm.value;

        switch (this.mode) {
          case 'login':
            await this.iamFacade.login(email, password);
            break;
          case 'register':
            await this.iamFacade.register(email, password, email.split('@')[0]);
            break;
          case 'reset':
            await this.iamFacade.resetPassword(email);
            this.errorMessage = '密碼重設郵件已發送';
            break;
        }
      } catch (error: any) {
        this.errorMessage = error.message || '操作失敗';
      }
    }
  }

  async onLogout(): Promise<void> {
    try {
      this.errorMessage = '';
      await this.iamFacade.logout();
    } catch (error: any) {
      this.errorMessage = error.message || '登出失敗';
    }
  }

  switchMode(newMode: 'login' | 'register' | 'reset'): void {
    this.mode = newMode;
    this.errorMessage = '';
    
    // 重設表單驗證
    if (newMode === 'reset') {
      this.authForm.get('password')?.clearValidators();
    } else {
      this.authForm.get('password')?.setValidators([Validators.required]);
    }
    this.authForm.get('password')?.updateValueAndValidity();
  }

  getSubmitLabel(): string {
    if (this.iconOnly) return '';
    
    switch (this.mode) {
      case 'login':
        return '信箱登入';
      case 'register':
        return '信箱註冊';
      case 'reset':
        return '寄送重設密碼信';
      default:
        return '提交';
    }
  }
}