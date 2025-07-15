// 用戶詳情元件
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { User } from '../../models/user.model';
import { getUserInitials } from '../../utils/user.util.ts';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="user-detail-container" *ngIf="user$ | async as user">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-bold">用戶詳情</h2>
        <div>
          <p-button 
            label="編輯" 
            icon="pi pi-pencil"
            class="mr-2"
            (onClick)="editUser()">
          </p-button>
          <p-button 
            [label]="user.isActive ? '停用' : '啟用'"
            [icon]="user.isActive ? 'pi pi-ban' : 'pi pi-check'"
            [severity]="user.isActive ? 'danger' : 'success'"
            (onClick)="toggleStatus()">
          </p-button>
        </div>
      </div>

      <div class="grid">
        <!-- 基本資訊 -->
        <div class="col-12 lg:col-8">
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">基本資訊</h3>
            
            <div class="flex align-items-center mb-4">
              <p-avatar 
                [label]="getUserInitials(user)"
                size="xlarge"
                class="mr-4">
              </p-avatar>
              <div>
                <h4 class="text-xl font-medium mb-1">{{ user.displayName || '未設定姓名' }}</h4>
                <p class="text-600 mb-2">{{ user.email }}</p>
                <p-tag 
                  [value]="user.isActive ? '啟用' : '停用'"
                  [severity]="user.isActive ? 'success' : 'danger'">
                </p-tag>
              </div>
            </div>

            <div class="grid">
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">用戶 ID</label>
                <p class="text-600">{{ user.uid }}</p>
              </div>
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">建立時間</label>
                <p class="text-600">{{ user.createdAt | date:'medium' }}</p>
              </div>
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">最後更新</label>
                <p class="text-600">{{ user.updatedAt | date:'medium' }}</p>
              </div>
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">最後登入</label>
                <p class="text-600">{{ user.lastLoginAt ? (user.lastLoginAt | date:'medium') : '從未登入' }}</p>
              </div>
            </div>
          </div>

          <!-- 權限資訊 -->
          <div class="bg-white p-4 border-round shadow-1">
            <h3 class="text-lg font-semibold mb-3">權限資訊</h3>
            
            <div class="mb-4">
              <label class="block text-900 font-medium mb-2">角色</label>
              <div class="flex flex-wrap gap-2">
                <p-chip 
                  *ngFor="let role of user.roles" 
                  [label]="role"
                  icon="pi pi-user">
                </p-chip>
                <p-chip 
                  *ngIf="user.roles.length === 0"
                  label="無角色"
                  severity="secondary">
                </p-chip>
              </div>
            </div>

            <div>
              <label class="block text-900 font-medium mb-2">直接權限</label>
              <div class="flex flex-wrap gap-2">
                <p-chip 
                  *ngFor="let permission of user.permissions" 
                  [label]="permission"
                  icon="pi pi-key">
                </p-chip>
                <p-chip 
                  *ngIf="!user.permissions || user.permissions.length === 0"
                  label="無直接權限"
                  severity="secondary">
                </p-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- 側邊欄 -->
        <div class="col-12 lg:col-4">
          <!-- 快速操作 -->
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">快速操作</h3>
            <div class="flex flex-column gap-2">
              <p-button 
                label="重設密碼" 
                icon="pi pi-key"
                [outlined]="true"
                class="w-full"
                (onClick)="resetPassword()">
              </p-button>
              <p-button 
                label="發送驗證郵件" 
                icon="pi pi-envelope"
                [outlined]="true"
                class="w-full"
                (onClick)="sendVerificationEmail()">
              </p-button>
              <p-button 
                label="檢視登入記錄" 
                icon="pi pi-history"
                [outlined]="true"
                class="w-full"
                (onClick)="viewLoginHistory()">
              </p-button>
            </div>
          </div>

          <!-- 統計資訊 -->
          <div class="bg-white p-4 border-round shadow-1">
            <h3 class="text-lg font-semibold mb-3">統計資訊</h3>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between">
                <span class="text-600">角色數量</span>
                <span class="font-medium">{{ user.roles.length }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-600">權限數量</span>
                <span class="font-medium">{{ user.permissions?.length || 0 }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-600">帳戶狀態</span>
                <p-tag 
                  [value]="user.isActive ? '正常' : '停用'"
                  [severity]="user.isActive ? 'success' : 'danger'"
                  size="small">
                </p-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!(user$ | async)" class="flex align-items-center justify-content-center min-h-screen">
      <p-progressSpinner></p-progressSpinner>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);

  user$!: Observable<User | undefined>;

  ngOnInit(): void {
    this.user$ = this.iamFacade.getSelectedUser();
  }

  editUser(): void {
    // 實現編輯功能
  }

  async toggleStatus(): Promise<void> {
    const user = await this.user$.pipe().toPromise();
    if (user) {
      await this.iamFacade.toggleUserStatus(user.uid);
    }
  }

  resetPassword(): void {
    // 實現重設密碼功能
  }

  sendVerificationEmail(): void {
    // 實現發送驗證郵件功能
  }

  viewLoginHistory(): void {
    // 實現檢視登入記錄功能
  }

  // 使用工具函數
  getUserInitials = getUserInitials;
}