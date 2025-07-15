// 本檔案為全域路由設定
// 功能：定義所有頁面路由、權限守衛、描述與重定向
// 用途：應用程式路由導航與權限保護
// -------------------------------------------------------------
// 【重要】Cloud Firestore 權限初始化說明
// 若要讓 admin 用戶能進入 /roles 頁面，請先到
// https://console.firebase.google.com/ → Firestore Database → 資料瀏覽器
// 建立下列結構：
//
// Collection: roles
//   └── Document: admin
//         └── Field: permissions（型別：Array）
//               └── 值: ["manage_roles", ...其他權限]
//
// 沒有此資料時，admin 用戶將無法通過 PermissionGuard 進入權限管理頁面。
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
  
  // 🚨 舊的角色管理路由 - 已遷移至 IAM 模組
  {
    path: 'roles',
    component: RoleManagementComponent,
    data: { 
      description: '角色權限管理 (已遷移)'
    }
  },
  
  // 🚨 舊的權限監控路由 - 已遷移至 IAM 模組
  {
    path: 'permission-monitor',
    loadComponent: () => import('../features/permission-management/permission-monitor-dashboard.component').then(c => c.PermissionMonitorDashboardComponent),
    data: { 
      description: '權限監控儀表板 (已遷移)'
    }
  },

  // ✅ 新的 IAM 模組路由
  {
    path: 'iam',
    loadChildren: () => import('../features/iam/iam.module').then(m => m.IamModule),
    data: {
      description: 'IAM 身份與存取管理'
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
