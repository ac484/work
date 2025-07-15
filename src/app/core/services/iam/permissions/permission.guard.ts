// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { UserService } from '../users/user.service';
import { PermissionService } from './permission.service';
import { PermissionMonitorService } from './permission-monitor.service';
import { Permission } from '../../../constants/permissions';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private permissionMonitor: PermissionMonitorService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // 支援單一權限（向後兼容）
    const singlePermission = route.data['permission'] as Permission;
    // 支援多重權限檢查
    const multiplePermissions = route.data['permissions'] as Permission[];
    // 支援權限檢查模式：'any' (任一權限) 或 'all' (所有權限)
    const permissionMode = route.data['permissionMode'] as 'any' | 'all' || 'any';

    let requiredPermissions: Permission[] = [];
    if (singlePermission) {
      requiredPermissions = [singlePermission];
    } else if (multiplePermissions && multiplePermissions.length > 0) {
      requiredPermissions = multiplePermissions;
    }

    return this.userService.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          // 記錄未登入的權限檢查
          this.permissionMonitor.checkRoutePermission(state.url, null);
          return of(this.router.createUrlTree(['/login']));
        }

        // 使用 PermissionMonitorService 進行統一權限檢查
        return from(this.permissionMonitor.checkRoutePermission(state.url, user)).pipe(
          switchMap(result => {
            if (result.granted) {
              // 如果有具體權限要求，進行詳細檢查
              if (requiredPermissions.length > 0) {
                return this.checkSpecificPermissions(user, requiredPermissions, permissionMode);
              }
              return of(true);
            } else {
              return of(this.router.createUrlTree(['/forbidden']));
            }
          })
        );
      })
    );
  }

  private async checkSpecificPermissions(
    user: any,
    requiredPermissions: Permission[],
    mode: 'any' | 'all'
  ): Promise<boolean> {
    if (mode === 'all') {
      return await this.permissionService.hasAllPermissions(user, requiredPermissions);
    } else {
      return await this.permissionService.hasAnyPermission(user, requiredPermissions);
    }
  }
}
