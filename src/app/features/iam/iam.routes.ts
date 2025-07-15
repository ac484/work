// IAM 模組路由配置
import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';
import { PermissionGuard } from './services/permissions/permission.guard';

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

  // 用戶管理路由（需要登入）
  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/users/user-list.component').then(m => m.UserListComponent),
        title: '用戶管理',
        data: { permissions: ['manage_roles'] },
        canActivate: [PermissionGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/users/user-profile.component').then(m => m.UserProfileComponent),
        title: '個人資料'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/users/user-detail.component').then(m => m.UserDetailComponent),
        title: '用戶詳情',
        data: { permissions: ['manage_roles'] },
        canActivate: [PermissionGuard]
      }
    ]
  },

  // 角色管理路由（需要管理權限）
  {
    path: 'roles',
    canActivate: [AuthGuard],
    data: { permissions: ['manage_roles'] },
    canActivateChild: [PermissionGuard],
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

  // 權限管理路由（需要管理權限）
  {
    path: 'permissions',
    canActivate: [AuthGuard],
    data: { permissions: ['manage_roles'] },
    canActivateChild: [PermissionGuard],
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

  // 預設重導向
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];