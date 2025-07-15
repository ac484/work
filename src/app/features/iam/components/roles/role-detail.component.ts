// 角色詳情元件
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { Role } from '../../models/role.model';
import { ALL_PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="role-detail-container" *ngIf="role$ | async as role">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-bold">角色詳情</h2>
        <div>
          <p-button 
            label="編輯" 
            icon="pi pi-pencil"
            class="mr-2"
            [disabled]="role.isSystem"
            (onClick)="editRole()">
          </p-button>
          <p-button 
            label="刪除"
            icon="pi pi-trash"
            severity="danger"
            [disabled]="role.isSystem"
            (onClick)="deleteRole()">
          </p-button>
        </div>
      </div>

      <div class="grid">
        <!-- 基本資訊 -->
        <div class="col-12 lg:col-8">
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">基本資訊</h3>
            
            <div class="grid">
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">角色 ID</label>
                <p class="text-600">{{ role.id }}</p>
              </div>
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">角色名稱</label>
                <p class="text-600">{{ role.name }}</p>
              </div>
              <div class="col-12">
                <label class="block text-900 font-medium mb-2">描述</label>
                <p class="text-600">{{ role.description || '無描述' }}</p>
              </div>
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">建立時間</label>
                <p class="text-600">{{ role.createdAt | date:'medium' }}</p>
              </div>
              <div class="col-6">
                <label class="block text-900 font-medium mb-2">最後更新</label>
                <p class="text-600">{{ role.updatedAt | date:'medium' }}</p>
              </div>
              <div class="col-12">
                <label class="block text-900 font-medium mb-2">類型</label>
                <p-tag 
                  [value]="role.isSystem ? '系統角色' : '自定義角色'"
                  [severity]="role.isSystem ? 'warning' : 'secondary'">
                </p-tag>
              </div>
            </div>
          </div>

          <!-- 權限列表 -->
          <div class="bg-white p-4 border-round shadow-1">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="text-lg font-semibold">權限列表</h3>
              <p-button 
                label="管理權限" 
                icon="pi pi-cog"
                [outlined]="true"
                size="small"
                [disabled]="role.isSystem"
                (onClick)="managePermissions()">
              </p-button>
            </div>
            
            <div class="permission-grid">
              <div class="grid">
                <div class="col-12" *ngFor="let category of getPermissionCategories()">
                  <h4 class="text-md font-medium mb-2 text-blue-600">{{ category.name }}</h4>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <p-chip 
                      *ngFor="let permission of category.permissions" 
                      [label]="permission"
                      [class]="hasPermission(role, permission) ? 'permission-granted' : 'permission-denied'"
                      [icon]="hasPermission(role, permission) ? 'pi pi-check' : 'pi pi-times'">
                    </p-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 側邊欄 -->
        <div class="col-12 lg:col-4">
          <!-- 統計資訊 -->
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">統計資訊</h3>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between">
                <span class="text-600">權限數量</span>
                <span class="font-medium">{{ role.permissions.length }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-600">用戶數量</span>
                <span class="font-medium">{{ getUserCount() }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-600">角色類型</span>
                <p-tag 
                  [value]="role.isSystem ? '系統' : '自定義'"
                  [severity]="role.isSystem ? 'warning' : 'secondary'"
                  size="small">
                </p-tag>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="bg-white p-4 border-round shadow-1 mb-4">
            <h3 class="text-lg font-semibold mb-3">快速操作</h3>
            <div class="flex flex-column gap-2">
              <p-button 
                label="指派給用戶" 
                icon="pi pi-user-plus"
                [outlined]="true"
                class="w-full"
                (onClick)="assignToUsers()">
              </p-button>
              <p-button 
                label="複製角色" 
                icon="pi pi-copy"
                [outlined]="true"
                class="w-full"
                (onClick)="duplicateRole()">
              </p-button>
              <p-button 
                label="匯出權限" 
                icon="pi pi-download"
                [outlined]="true"
                class="w-full"
                (onClick)="exportPermissions()">
              </p-button>
            </div>
          </div>

          <!-- 相關用戶 -->
          <div class="bg-white p-4 border-round shadow-1">
            <h3 class="text-lg font-semibold mb-3">相關用戶</h3>
            <div class="flex flex-column gap-2">
              <!-- 這裡應該顯示擁有此角色的用戶列表 -->
              <p class="text-600 text-center">載入中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!(role$ | async)" class="flex align-items-center justify-content-center min-h-screen">
      <p-progressSpinner></p-progressSpinner>
    </div>
  `,
  styles: [`
    .permission-granted {
      background-color: #d4edda !important;
      color: #155724 !important;
    }
    .permission-denied {
      background-color: #f8d7da !important;
      color: #721c24 !important;
    }
  `]
})
export class RoleDetailComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);

  role$!: Observable<Role | undefined>;

  ngOnInit(): void {
    this.role$ = this.iamFacade.getSelectedRole();
  }

  editRole(): void {
    // 實現編輯功能
  }

  async deleteRole(): Promise<void> {
    const role = await this.role$.pipe().toPromise();
    if (role && !role.isSystem) {
      await this.iamFacade.deleteRole(role.id);
    }
  }

  managePermissions(): void {
    // 實現權限管理功能
  }

  assignToUsers(): void {
    // 實現指派給用戶功能
  }

  duplicateRole(): void {
    // 實現複製角色功能
  }

  exportPermissions(): void {
    // 實現匯出權限功能
  }

  hasPermission(role: Role, permission: string): boolean {
    return role.permissions.includes(permission);
  }

  getUserCount(): number {
    // 這裡應該從服務獲取實際的用戶數量
    return 0;
  }

  getPermissionCategories() {
    // 將權限按類別分組
    const categories = [
      {
        name: '合約管理',
        permissions: ALL_PERMISSIONS.filter((p: string) => p.includes('contract'))
      },
      {
        name: '請款管理',
        permissions: ALL_PERMISSIONS.filter((p: string) => p.includes('payment'))
      },
      {
        name: '系統管理',
        permissions: ALL_PERMISSIONS.filter((p: string) => p.includes('manage') || p.includes('finance'))
      },
      {
        name: '其他',
        permissions: ALL_PERMISSIONS.filter((p: string) => 
          !p.includes('contract') && 
          !p.includes('payment') && 
          !p.includes('manage') && 
          !p.includes('finance')
        )
      }
    ];

    return categories.filter(c => c.permissions.length > 0);
  }
}