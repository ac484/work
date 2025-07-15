// IAM 系統狀態管理組件
import { Component, inject, OnInit } from '@angular/core';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { getRoleStats, resetSystemRoles } from '../../utils/role-init.util';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-iam-system-status',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="iam-system-status">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-bold">IAM 系統狀態</h2>
        <p-button 
          label="重新整理" 
          icon="pi pi-refresh"
          [outlined]="true"
          (onClick)="refreshStatus()">
        </p-button>
      </div>

      <!-- 系統狀態卡片 -->
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2" *ngIf="systemStatus.initialized"></i>
            <i class="pi pi-times-circle text-4xl text-red-500 mb-2" *ngIf="!systemStatus.initialized"></i>
            <h4 class="text-sm font-medium text-600 mb-1">系統狀態</h4>
            <p class="text-xl font-bold" [class]="systemStatus.initialized ? 'text-green-600' : 'text-red-600'">
              {{ systemStatus.initialized ? '已初始化' : '未初始化' }}
            </p>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-users text-4xl text-blue-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">系統角色</h4>
            <p class="text-xl font-bold text-900">{{ roleStats.systemRoles }}</p>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-cog text-4xl text-orange-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">總角色數</h4>
            <p class="text-xl font-bold text-900">{{ roleStats.totalRoles }}</p>
          </div>
        </div>
      </div>

      <!-- 系統操作 -->
      <div class="bg-white p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg font-semibold mb-3">系統操作</h3>
        <div class="flex flex-wrap gap-2">
          <p-button 
            label="初始化系統" 
            icon="pi pi-play"
            severity="success"
            [disabled]="systemStatus.initialized || loading"
            [loading]="loading"
            (onClick)="initializeSystem()">
          </p-button>
          
          <p-button 
            label="強制重新初始化" 
            icon="pi pi-refresh"
            severity="warning"
            [loading]="loading"
            (onClick)="forceReinitialize()">
          </p-button>
          
          <p-button 
            label="重置系統角色" 
            icon="pi pi-replay"
            severity="danger"
            [loading]="loading"
            (onClick)="resetRoles()">
          </p-button>
        </div>
      </div>

      <!-- 角色狀態詳情 -->
      <div class="bg-white p-4 border-round shadow-1">
        <h3 class="text-lg font-semibold mb-3">角色狀態詳情</h3>
        <div class="grid">
          <div class="col-12 md:col-6" *ngFor="let role of defaultRoles">
            <div class="flex align-items-center justify-content-between p-2 border-round mb-2"
                 [class]="role.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <div class="flex align-items-center">
                <i class="pi mr-2" 
                   [class]="role.exists ? 'pi-check text-green-600' : 'pi-times text-red-600'"></i>
                <div>
                  <div class="font-medium">{{ role.name }}</div>
                  <div class="text-sm text-600">{{ role.id }}</div>
                </div>
              </div>
              <p-tag 
                [value]="role.exists ? '存在' : '缺失'"
                [severity]="role.exists ? 'success' : 'danger'"
                size="small">
              </p-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作結果訊息 -->
      <p-message 
        *ngIf="message" 
        [severity]="message.type" 
        [text]="message.text"
        class="mt-4">
      </p-message>
    </div>
  `
})
export class IamSystemStatusComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);
  private firestore = inject(Firestore);

  systemStatus = {
    initialized: false
  };

  roleStats = {
    totalRoles: 0,
    systemRoles: 0,
    customRoles: 0
  };

  defaultRoles = [
    { id: 'admin', name: '系統管理員', exists: false },
    { id: 'manager', name: '專案管理者', exists: false },
    { id: 'finance', name: '財務人員', exists: false },
    { id: 'user', name: '一般用戶', exists: false },
    { id: 'guest', name: '訪客', exists: false }
  ];

  loading = false;
  message: { type: 'success' | 'error' | 'info' | 'warning', text: string } | null = null;

  ngOnInit(): void {
    this.refreshStatus();
  }

  async refreshStatus(): Promise<void> {
    try {
      // 檢查系統初始化狀態
      this.systemStatus.initialized = this.iamFacade.isSystemInitialized();

      // 獲取角色統計
      this.roleStats = await getRoleStats(this.firestore);

      // 檢查預設角色存在狀態
      await this.checkDefaultRoles();

    } catch (error) {
      console.error('刷新狀態失敗:', error);
      this.showMessage('error', '刷新狀態失敗');
    }
  }

  async initializeSystem(): Promise<void> {
    this.loading = true;
    try {
      await this.iamFacade.initializeSystem();
      await this.refreshStatus();
      this.showMessage('success', 'IAM 系統初始化完成');
    } catch (error) {
      console.error('系統初始化失敗:', error);
      this.showMessage('error', '系統初始化失敗');
    } finally {
      this.loading = false;
    }
  }

  async forceReinitialize(): Promise<void> {
    this.loading = true;
    try {
      await this.iamFacade.forceReinitialize();
      await this.refreshStatus();
      this.showMessage('success', 'IAM 系統重新初始化完成');
    } catch (error) {
      console.error('強制重新初始化失敗:', error);
      this.showMessage('error', '強制重新初始化失敗');
    } finally {
      this.loading = false;
    }
  }

  async resetRoles(): Promise<void> {
    this.loading = true;
    try {
      await resetSystemRoles(this.firestore);
      await this.refreshStatus();
      this.showMessage('success', '系統角色重置完成');
    } catch (error) {
      console.error('角色重置失敗:', error);
      this.showMessage('error', '角色重置失敗');
    } finally {
      this.loading = false;
    }
  }

  private async checkDefaultRoles(): Promise<void> {
    const { checkRoleExists } = await import('../../utils/role-init.util');
    
    for (const role of this.defaultRoles) {
      role.exists = await checkRoleExists(this.firestore, role.id);
    }
  }

  private showMessage(type: 'success' | 'error' | 'info' | 'warning', text: string): void {
    this.message = { type, text };
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }
}