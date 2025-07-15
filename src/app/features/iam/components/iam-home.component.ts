// IAM 系統主頁組件
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimeNgModule } from '../../../shared/modules/prime-ng.module';

@Component({
  selector: 'app-iam-home',
  standalone: true,
  imports: [PrimeNgModule, RouterLink],
  template: `
    <div class="iam-home-container p-6">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-900 mb-2">
          <i class="pi pi-shield mr-3 text-blue-600"></i>
          IAM 身份與存取管理
        </h1>
        <p class="text-600 text-lg">統一的身份認證與權限管理系統</p>
      </div>

      <div class="grid">
        <!-- 用戶管理卡片 -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="bg-white border-round shadow-1 p-4 h-full">
            <div class="flex align-items-center mb-3">
              <i class="pi pi-users text-2xl text-blue-600 mr-3"></i>
              <h3 class="text-xl font-semibold m-0">用戶管理</h3>
            </div>
            <p class="text-600 mb-4">管理系統用戶、查看用戶資訊、分配角色權限</p>
            <div class="flex gap-2">
              <p-button 
                label="用戶列表" 
                [routerLink]="['/iam/users']"
                size="small">
              </p-button>
              <p-button 
                label="個人資料" 
                [routerLink]="['/iam/users/profile']"
                [outlined]="true"
                size="small">
              </p-button>
            </div>
          </div>
        </div>

        <!-- 角色管理卡片 -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="bg-white border-round shadow-1 p-4 h-full">
            <div class="flex align-items-center mb-3">
              <i class="pi pi-key text-2xl text-green-600 mr-3"></i>
              <h3 class="text-xl font-semibold m-0">角色管理</h3>
            </div>
            <p class="text-600 mb-4">配置系統角色、設定權限、管理角色層級</p>
            <div class="flex gap-2">
              <p-button 
                label="角色列表" 
                [routerLink]="['/iam/roles']"
                size="small">
              </p-button>
            </div>
          </div>
        </div>

        <!-- 權限管理卡片 -->
        <div class="col-12 md:col-6 lg:col-4">
          <div class="bg-white border-round shadow-1 p-4 h-full">
            <div class="flex align-items-center mb-3">
              <i class="pi pi-eye text-2xl text-orange-600 mr-3"></i>
              <h3 class="text-xl font-semibold m-0">權限監控</h3>
            </div>
            <p class="text-600 mb-4">監控權限使用情況、查看審計記錄、分析權限矩陣</p>
            <div class="flex gap-2">
              <p-button 
                label="權限監控" 
                [routerLink]="['/iam/permissions/monitor']"
                size="small">
              </p-button>
              <p-button 
                label="權限矩陣" 
                [routerLink]="['/iam/permissions/matrix']"
                [outlined]="true"
                size="small">
              </p-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 系統狀態 -->
      <div class="mt-6">
        <div class="bg-blue-50 border-round p-4">
          <div class="flex align-items-center">
            <i class="pi pi-info-circle text-blue-600 mr-2"></i>
            <span class="font-semibold text-blue-900">系統資訊</span>
          </div>
          <div class="mt-3 grid">
            <div class="col-12 md:col-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-900">Angular v20</div>
                <div class="text-sm text-blue-600">前端框架</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-900">PrimeNG 20</div>
                <div class="text-sm text-blue-600">UI 組件庫</div>
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-900">Firebase</div>
                <div class="text-sm text-blue-600">後端服務</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IamHomeComponent {
}