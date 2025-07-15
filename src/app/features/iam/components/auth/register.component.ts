// 註冊元件
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="register-container flex align-items-center justify-content-center min-h-screen">
      <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
        <div class="text-center mb-5">
          <div class="text-900 text-3xl font-medium mb-3">建立新帳戶</div>
          <span class="text-600 font-medium line-height-3">請填寫以下資訊完成註冊</span>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="displayName" class="block text-900 font-medium mb-2">姓名</label>
            <input 
              id="displayName" 
              type="text" 
              pInputText 
              formControlName="displayName"
              class="w-full mb-3" 
              placeholder="請輸入您的姓名"
              [class.ng-invalid]="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched">
            <small 
              class="p-error block" 
              *ngIf="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched">
              姓名為必填項目
            </small>
          </div>

          <div class="field">
            <label for="email" class="block text-900 font-medium mb-2">電子郵件</label>
            <input 
              id="email" 
              type="email" 
              pInputText 
              formControlName="email"
              class="w-full mb-3" 
              placeholder="請輸入電子郵件"
              [class.ng-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            <small 
              class="p-error block" 
              *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
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
              [feedback]="true"
              styleClass="w-full mb-3"
              inputStyleClass="w-full"
              [class.ng-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            </p-password>
            <small 
              class="p-error block" 
              *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              密碼至少需要6個字元
            </small>
          </div>

          <div class="field">
            <label for="confirmPassword" class="block text-900 font-medium mb-2">確認密碼</label>
            <p-password 
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="請再次輸入密碼"
              [toggleMask]="true"
              [feedback]="false"
              styleClass="w-full mb-3"
              inputStyleClass="w-full"
              [class.ng-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
            </p-password>
            <small 
              class="p-error block" 
              *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              密碼確認不符
            </small>
          </div>

          <p-button 
            label="註冊" 
            type="submit"
            [disabled]="registerForm.invalid || isLoading"
            [loading]="isLoading"
            styleClass="w-full mb-4">
          </p-button>

          <div class="text-center">
            <span class="text-600 font-medium line-height-3">已經有帳戶了？</span>
            <a class="font-medium no-underline ml-2 text-blue-500 cursor-pointer" 
               (click)="goToLogin()">
              立即登入
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private iamFacade = inject(IamFacadeService);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password, displayName } = this.registerForm.value;
        await this.iamFacade.register(email, password, displayName);
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.errorMessage = error.message || '註冊失敗，請稍後再試';
      } finally {
        this.isLoading = false;
      }
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}