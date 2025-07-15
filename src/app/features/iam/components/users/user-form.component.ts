// 用戶表單元件
import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="email" class="block text-900 font-medium mb-2">電子郵件 *</label>
        <input 
          id="email" 
          type="email" 
          pInputText 
          formControlName="email"
          class="w-full"
          placeholder="請輸入電子郵件">
        <small class="p-error block" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
          請輸入有效的電子郵件地址
        </small>
      </div>

      <div class="field">
        <label for="displayName" class="block text-900 font-medium mb-2">顯示名稱</label>
        <input 
          id="displayName" 
          type="text" 
          pInputText 
          formControlName="displayName"
          class="w-full"
          placeholder="請輸入顯示名稱">
      </div>

      <div class="field">
        <label for="roles" class="block text-900 font-medium mb-2">角色</label>
        <p-multiSelect 
          id="roles"
          formControlName="roles"
          [options]="roleOptions"
          placeholder="選擇角色"
          class="w-full">
        </p-multiSelect>
      </div>

      <div class="field">
        <div class="flex align-items-center">
          <p-checkbox 
            id="isActive" 
            formControlName="isActive" 
            [binary]="true">
          </p-checkbox>
          <label for="isActive" class="ml-2">啟用帳戶</label>
        </div>
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <p-button 
          label="取消" 
          [outlined]="true"
          (onClick)="onCancel()">
        </p-button>
        <p-button 
          label="儲存" 
          type="submit"
          [disabled]="userForm.invalid || isLoading"
          [loading]="isLoading">
        </p-button>
      </div>
    </form>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private iamFacade = inject(IamFacadeService);

  @Output() userSaved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  userForm: FormGroup;
  isLoading = false;

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest' }
  ];

  constructor() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: [''],
      roles: [[]],
      isActive: [true]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid) {
      this.isLoading = true;

      try {
        const formValue = this.userForm.value;
        // 這裡需要生成 UID，實際應用中可能需要不同的邏輯
        const uid = this.generateUID();
        
        await this.iamFacade.createUser({
          uid,
          email: formValue.email,
          displayName: formValue.displayName,
          roles: formValue.roles,
          isActive: formValue.isActive
        });

        this.userSaved.emit();
      } catch (error) {
        console.error('Create user error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private generateUID(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}