// IAM 模組路由配置
import { Routes } from '@angular/router';
// 暫時簡化路由配置，移除守衛以避免循環依賴
// TODO: 實現完整的守衛系統

export const iamRoutes: Routes = [
  // 認證相關路由（無需登入）
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
    title: '登入'
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent),
    title: '註冊'
  },
  {
    path: 'logout',
    loadComponent: () => import('./components/auth/logout.component').then(m => m.LogoutComponent),
    title: '登出'
  },

  // 用戶管理路由
  {
    path: 'users',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/users/user-list.component').then(m => m.UserListComponent),
        title: '用戶管理'
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/users/user-profile.component').then(m => m.UserProfileComponent),
        title: '個人資料'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/users/user-detail.component').then(m => m.UserDetailComponent),
        title: '用戶詳情'
      }
    ]
  },

  // 角色管理路由
  {
    path: 'roles',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/roles/role-list.component').then(m => m.RoleListComponent),
        title: '角色管理'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/roles/role-detail.component').then(m => m.RoleDetailComponent),
        title: '角色詳情'
      }
    ]
  },

  // 權限管理路由
  {
    path: 'permissions',
    children: [
      {
        path: 'monitor',
        loadComponent: () => import('./components/permissions/permission-monitor.component').then(m => m.PermissionMonitorComponent),
        title: '權限監控'
      },
      {
        path: 'matrix',
        loadComponent: () => import('./components/permissions/permission-matrix.component').then(m => m.PermissionMatrixComponent),
        title: '權限矩陣'
      },
      {
        path: '',
        redirectTo: 'monitor',
        pathMatch: 'full'
      }
    ]
  },

  // 系統管理路由
  {
    path: 'admin',
    children: [
      {
        path: 'status',
        loadComponent: () => import('./components/admin/iam-system-status.component').then(m => m.IamSystemStatusComponent),
        title: 'IAM 系統狀態'
      },
      {
        path: '',
        redirectTo: 'status',
        pathMatch: 'full'
      }
    ]
  },

  // IAM 主頁
  {
    path: '',
    loadComponent: () => import('./components/iam-home.component').then(m => m.IamHomeComponent),
    title: 'IAM 管理'
  }
];