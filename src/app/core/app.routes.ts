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
  {
    path: 'roles',
    component: RoleManagementComponent,
    canActivate: [PermissionGuard],
    data: { 
      permission: PERMISSIONS.MANAGE_ROLES,
      description: '角色權限管理'
    }
  },
  // 新增 Workspace 應用分割畫面（懶加載）
  {
    path: 'workspace',
    loadComponent: () => import('../features/workspace/workspace.component').then(m => m.WorkspaceComponent),
    canActivate: [PermissionGuard],
    data: {
      permission: PERMISSIONS.VIEW_CONTRACT,
      description: '工作區分割畫面'
    }
  },
  // 新增權限監控儀表板路由（僅限管理員）
  {
    path: 'permission-monitor',
    loadComponent: () => import('../features/permission-management/permission-monitor-dashboard.component').then(c => c.PermissionMonitorDashboardComponent),
    canActivate: [PermissionGuard],
    data: { 
      permission: PERMISSIONS.MANAGE_ROLES,
      description: '權限監控儀表板'
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
