// 用戶個人資料元件
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { AuthUser } from '../../models/auth.model';
import { getUserInitials } from '../../utils/auth.util';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="user-profile-container">
      <h2 class="text-2xl font-bold mb-4">個人資料</h2>

      <div class="grid" *ngIf="currentUser$ | async as user">
        <!-- 個人資料表單 -->
        <div class="col-12 lg:col-8">
          <div class="bg-white p-4 border-round shadow-1">
            <h3 class="text-lg font-semibold mb-4">基本資訊</h3>
            
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
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
                <label for="email" class="block text-900 font-medium mb-2">電子郵件</label>
                <input 
                  id="email" 
                  type="email" 
                  pInputText 
                  formControlName="email"
                  class="w-full"
                  [readonly]="true">
                <small class="text-600">電子郵件無法修改</small>
              </div>

              <div class="field">
                <label for="phone" class="block text-900 font-medium mb-2">電話號碼</label>
                <input 
                  id="phone" 
                  type="tel" 
                  pInputText 
                  formControlName="phone"
                  class="w-full"
                  placeholder="請輸入電話號碼">
              </div>

              <div class="field">
                <label for="department" class="block text-900 font-medium mb-2">部門</label>
                <input 
                  id="department" 
                  type="text" 
                  pInputText 
                  formControlName="department"
                  class="w-full"
                  placeholder="請輸入部門">
              </div>

              <div class="field">
                <label for="position" class="block text-900 font-medium mb-2">職位</label>
                <input 
                  id="position" 
                  type="text" 
                  pInputText 
                  formControlName="position"
                  class="w-full"
                  placeholder="請輸入職位">
              </div>

              <div class="flex justify-content-end gap-2 mt-4">
                <p-button 
                  label="重設" 
                  [outlined]="true"
                  (onClick)="resetForm()">
                </p-button>
                <p-button 
                  label="儲存變更" 
                  type="submit"
                  [disabled]="profileForm.invalid || isLoading"
                  [loading]="isLoading">
                </p-button>
              </div>
            </form>
          </div>
        </div>

        <!-- 側邊欄 -->
        <div class="col-12 lg:col-4">
          <!-- 頭像區域 -->
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">頭像</h3>
            <div class="text-center">
              <p-avatar 
                [label]="getUserInitials(user)"
                size="xlarge"
                class="mb-3">
              </p-avatar>
              <div>
                <p-button 
                  label="上傳頭像" 
                  icon="pi pi-upload"
                  [outlined]="true"
                  size="small"
                  (onClick)="uploadAvatar()">
                </p-button>
              </div>
            </div>
          </div>

          <!-- 帳戶資訊 -->
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">帳戶資訊</h3>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between">
                <span class="text-600">用戶 ID</span>
                <span class="font-medium text-sm">{{ user.uid }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-600">郵件驗證</span>
                <p-tag 
                  [value]="user.emailVerified ? '已驗證' : '未驗證'"
                  [severity]="user.emailVerified ? 'success' : 'warning'"
                  size="small">
                </p-tag>
              </div>
            </div>
          </div>

          <!-- 安全設定 -->
          <div class="bg-white p-4 border-round shadow-1">
            <h3 class="text-lg font-semibold mb-3">安全設定</h3>
            <div class="flex flex-column gap-2">
              <p-button 
                label="變更密碼" 
                icon="pi pi-key"
                [outlined]="true"
                class="w-full"
                (onClick)="changePassword()">
              </p-button>
              <p-button 
                label="兩步驟驗證" 
                icon="pi pi-shield"
                [outlined]="true"
                class="w-full"
                (onClick)="setupTwoFactor()">
              </p-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private iamFacade = inject(IamFacadeService);

  currentUser$!: Observable<AuthUser | null>;
  profileForm: FormGroup;
  isLoading = false;

  constructor() {
    this.profileForm = this.fb.group({
      displayName: [''],
      email: [''],
      phone: [''],
      department: [''],
      position: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser$ = this.iamFacade.getCurrentUser();
    
    // 載入用戶資料到表單
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          displayName: user.displayName || '',
          email: user.email
        });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.valid) {
      this.isLoading = true;

      try {
        const formValue = this.profileForm.value;
        // TODO: 實現更新個人資料的邏輯
        // await this.userProfileService.updateProfile(formValue);
      } catch (error) {
        // 處理錯誤
      } finally {
        this.isLoading = false;
      }
    }
  }

  resetForm(): void {
    // 重新載入原始資料
    this.ngOnInit();
  }

  uploadAvatar(): void {
    // 實現頭像上傳功能
  }

  changePassword(): void {
    // 實現變更密碼功能
  }

  setupTwoFactor(): void {
    // 實現兩步驟驗證設定功能
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}