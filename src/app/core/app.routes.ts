// 本檔案為全域路由設定
// 功能：定義所有頁面路由、權限守衛、描述與重定向
// 用途：應用程式路由導航與權限保護
// -------------------------------------------------------------
// 【重要】IAM 系統說明
// 新的 IAM 系統提供完整的身份與存取管理功能：
// - 用戶管理：/iam/users
// - 角色管理：/iam/roles  
// - 權限監控：/iam/permissions/monitor
// - 權限矩陣：/iam/permissions/matrix
// - 個人資料：/iam/users/profile
// 
// 舊的權限管理路由已遷移至 IAM 模組，提供更完整的功能。
// -------------------------------------------------------------

import { Routes } from '@angular/router';
import { HubComponent } from '../features/hub/hub.component';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { RoleManagementComponent } from '../features/role-management/role-management.component';
import { PermissionGuard } from './services/iam/permissions/permission.guard';
import { PERMISSIONS } from './constants/permissions';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: PERMISSIONS.VIEW_CONTRACT,
      description: '儀表板檢視'
    }
  },
  {
    path: 'hub',
    component: HubComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: PERMISSIONS.VIEW_CONTRACT,
      description: '合約管理中樞'
    }
  },

  // ✅ IAM 身份與存取管理模組 (主要權限系統)
  {
    path: 'iam',
    loadChildren: () => import('../features/iam/iam.module').then(m => m.IamModule),
    data: {
      description: 'IAM 身份與存取管理'
    }
  },

  // 🔄 舊路由重定向至新 IAM 系統
  {
    path: 'roles',
    redirectTo: '/iam/roles',
    pathMatch: 'full'
  },
  {
    path: 'permission-monitor',
    redirectTo: '/iam/permissions/monitor',
    pathMatch: 'full'
  },
  {
    path: 'users',
    redirectTo: '/iam/users',
    pathMatch: 'full'
  },

  // 🚨 遷移提示頁面 (備用，如果需要顯示遷移訊息)
  {
    path: 'legacy-roles',
    component: RoleManagementComponent,
    data: {
      description: '角色權限管理 (遷移提示)'
    }
  },
  {
    path: 'legacy-permission-monitor',
    loadComponent: () => import('../features/permission-management/permission-monitor-dashboard.component').then(c => c.PermissionMonitorDashboardComponent),
    data: {
      description: '權限監控儀表板 (遷移提示)'
    }
  },

  // 合約模組路由
  {
    path: 'contract',
    loadChildren: () => import('../features/contract/contract.module').then(m => m.ContractModule),
    data: {
      description: '合約管理'
    }
  },

  // Workspace 應用分割畫面（懶加載）
  {
    path: 'workspace',
    loadComponent: () => import('../features/workspace/workspace.component').then(m => m.WorkspaceComponent),
    canActivate: [PermissionGuard],
    data: {
      permission: PERMISSIONS.VIEW_CONTRACT,
      description: '工作區分割畫面'
    }
  },

  // 預設路由重定向
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // 404 頁面
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
