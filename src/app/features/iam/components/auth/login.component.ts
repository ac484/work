// 登入元件
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="login-container flex align-items-center justify-content-center min-h-screen">
      <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
        <div class="text-center mb-5">
          <div class="text-900 text-3xl font-medium mb-3">歡迎回來</div>
          <span class="text-600 font-medium line-height-3">請登入您的帳戶</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email" class="block text-900 font-medium mb-2">電子郵件</label>
            <input 
              id="email" 
              type="email" 
              pInputText 
              formControlName="email"
              class="w-full mb-3" 
              placeholder="請輸入電子郵件"
              [class.ng-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            <small 
              class="p-error block" 
              *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              請輸入有效的電子郵件地址
            </small>
          </div>

          <div class="field">
            <label for="password" class="block text-900 font-medium mb-2">密碼</label>
            <p-password 
              id="password"
              formControlName="password"
              placeholder="請輸入密碼"
              [toggleMask]="true"
              [feedback]="false"
              styleClass="w-full mb-3"
              inputStyleClass="w-full"
              [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            </p-password>
            <small 
              class="p-error block" 
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              密碼為必填項目
            </small>
          </div>

          <div class="flex align-items-center justify-content-between mb-6">
            <div class="flex align-items-center">
              <p-checkbox 
                id="rememberMe" 
                formControlName="rememberMe" 
                [binary]="true">
              </p-checkbox>
              <label for="rememberMe" class="ml-2">記住我</label>
            </div>
            <a class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
              忘記密碼？
            </a>
          </div>

          <p-button 
            label="登入" 
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            [loading]="isLoading"
            styleClass="w-full mb-4">
          </p-button>

          <div class="text-center">
            <span class="text-600 font-medium line-height-3">還沒有帳戶？</span>
            <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer" 
               (click)="goToRegister()">
              立即註冊
            </a>
          </div>
        </form>

        <p-message 
          *ngIf="errorMessage" 
          severity="error" 
          [text]="errorMessage"
          styleClass="w-full mt-3">
        </p-message>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private iamFacade = inject(IamFacadeService);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        await this.iamFacade.login(email, password);
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.errorMessage = error.message || '登入失敗，請稍後再試';
      } finally {
        this.isLoading = false;
      }
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}