// IAM 模組定義
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// PrimeNG 模組
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';

// 服務
import { IamFacadeService } from './services/core/iam-facade.service';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/users/user.service';
import { RoleService } from './services/roles/role.service';
import { PermissionService } from './services/permissions/permission.service';
import { AuthInterceptor } from './services/auth/auth.interceptor';

// 守衛
import { AuthGuard } from './services/auth/auth.guard';
import { RoleGuard } from './services/roles/role.guard';
import { PermissionGuard } from './services/permissions/permission.guard';

// 元件
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { LogoutComponent } from './components/auth/logout.component';
import { UserListComponent } from './components/users/user-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { UserFormComponent } from './components/users/user-form.component';
import { UserProfileComponent } from './components/users/user-profile.component';
import { RoleListComponent } from './components/roles/role-list.component';
import { RoleDetailComponent } from './components/roles/role-detail.component';
import { RoleFormComponent } from './components/roles/role-form.component';
import { PermissionMonitorComponent } from './components/permissions/permission-monitor.component';
import { PermissionMatrixComponent } from './components/permissions/permission-matrix.component';
import { UserAvatarComponent } from './components/shared/user-avatar.component';
import { RoleBadgeComponent } from './components/shared/role-badge.component';
import { PermissionChipComponent } from './components/shared/permission-chip.component';

// 路由
import { iamRoutes } from './iam.routes';

@NgModule({
  imports: [
    CommonModule,
    PrimeNgModule,
    RouterModule.forChild(iamRoutes),
    
    // Standalone 元件
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    UserListComponent,
    UserDetailComponent,
    UserFormComponent,
    UserProfileComponent,
    RoleListComponent,
    RoleDetailComponent,
    RoleFormComponent,
    PermissionMonitorComponent,
    PermissionMatrixComponent,
    UserAvatarComponent,
    RoleBadgeComponent,
    PermissionChipComponent
  ],
  providers: [
    // 核心服務
    IamFacadeService,
    
    // 專門服務
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    
    // 守衛
    AuthGuard,
    RoleGuard,
    PermissionGuard,
    
    // 攔截器
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  exports: [
    // 匯出常用元件供外部使用
    LoginComponent,
    RegisterComponent,
    UserListComponent,
    RoleListComponent,
    PermissionMonitorComponent,
    UserAvatarComponent,
    RoleBadgeComponent,
    PermissionChipComponent
  ]
})
export class IamModule {
  // 靜態方法提供配置
  static forRoot() {
    return {
      ngModule: IamModule,
      providers: [
        IamFacadeService,
        AuthService,
        UserService,
        RoleService,
        PermissionService
      ]
    };
  }
}