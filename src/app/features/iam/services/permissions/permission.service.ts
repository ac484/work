// 權限服務 - 處理權限檢查和管理
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { PermissionCheck } from '../../models/permission.model';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';
import { RoleService } from '../roles/role.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  private permissionChecks$ = new BehaviorSubject<PermissionCheck[]>([]);

  async checkPermission(permission: string, resource?: string, resourceId?: string): Promise<boolean> {
    const currentUser = await this.authService.getCurrentUser().pipe(map(u => u)).toPromise();
    
    if (!currentUser) {
      this.logPermissionCheck(
        'anonymous',
        permission,
        resource,
        resourceId,
        false,
        'User not authenticated'
      );
      return false;
    }

    // 獲取用戶完整資料
    const user = await this.userService.getUserById(currentUser.uid).pipe(map(u => u)).toPromise();
    
    if (!user || !user.isActive) {
      this.logPermissionCheck(
        currentUser.uid,
        permission,
        resource,
        resourceId,
        false,
        'User not found or inactive'
      );
      return false;
    }

    // 檢查用戶直接權限
    if (user.permissions && user.permissions.includes(permission)) {
      this.logPermissionCheck(currentUser.uid, permission, resource, resourceId, true);
      return true;
    }

    // 檢查角色權限
    const hasRolePermission = await this.checkRolePermissions(user.roles, permission);
    
    this.logPermissionCheck(
      currentUser.uid,
      permission,
      resource,
      resourceId,
      hasRolePermission,
      hasRolePermission ? undefined : 'Permission denied'
    );

    return hasRolePermission;
  }

  getUserPermissions(uid: string): Observable<string[]> {
    return this.userService.getUserById(uid).pipe(
      map(user => {
        if (!user) return [];
        
        // 合併直接權限和角色權限
        const directPermissions = user.permissions || [];
        // 這裡需要獲取角色權限，簡化實現
        return directPermissions;
      })
    );
  }

  getRolePermissions(roleId: string): Observable<string[]> {
    return this.roleService.getRoleById(roleId).pipe(
      map(role => role?.permissions || [])
    );
  }

  getPermissionChecks(): Observable<PermissionCheck[]> {
    return this.permissionChecks$.asObservable();
  }

  private async checkRolePermissions(roleIds: string[], permission: string): Promise<boolean> {
    for (const roleId of roleIds) {
      const role = await this.roleService.getRoleById(roleId).pipe(map(r => r)).toPromise();
      if (role && role.permissions.includes(permission)) {
        return true;
      }
    }
    return false;
  }

  private logPermissionCheck(
    userId: string,
    permission: string,
    resource?: string,
    resourceId?: string,
    granted: boolean = false,
    reason?: string
  ): void {
    const check: PermissionCheck = {
      userId,
      permission,
      resource,
      resourceId,
      granted,
      reason,
      timestamp: new Date()
    };

    // 添加到內存記錄
    const currentChecks = this.permissionChecks$.value;
    this.permissionChecks$.next([check, ...currentChecks.slice(0, 99)]); // 保留最近100條

    // 可選：保存到 Firestore
    this.savePermissionCheck(check);
  }

  private async savePermissionCheck(check: PermissionCheck): Promise<void> {
    try {
      const checkId = `${check.userId}_${check.timestamp.getTime()}`;
      const checkDoc = doc(this.firestore, 'permissionChecks', checkId);
      await setDoc(checkDoc, check);
    } catch (error) {
      console.warn('Failed to save permission check:', error);
    }
  }
}