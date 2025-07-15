// 🚨 此服務已遷移至新的 IAM 模組
// 新路徑: src/app/features/iam/services/permissions/permission.service.ts
// 請使用新的 IamFacadeService 進行權限管理

// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AppUser } from '../users/user.service';
import { Permission } from '../../../constants/permissions';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private firestore = inject(Firestore);
  private permissionCache = new Map<string, string[]>(); // 簡單快取

  // 原子化權限檢查：檢查用戶是否有特定權限
  async hasPermission(user: AppUser | null, permission: Permission): Promise<boolean> {
    if (!user) return false;
    const userPerms = await this.getUserPermissions(user);
    return userPerms.includes(permission);
  }

  // 批量權限檢查：檢查用戶是否有多個權限中的任一個
  async hasAnyPermission(user: AppUser | null, permissions: Permission[]): Promise<boolean> {
    if (!user || permissions.length === 0) return false;
    const userPerms = await this.getUserPermissions(user);
    return permissions.some(perm => userPerms.includes(perm));
  }

  // 批量權限檢查：檢查用戶是否有所有權限
  async hasAllPermissions(user: AppUser | null, permissions: Permission[]): Promise<boolean> {
    if (!user || permissions.length === 0) return false;
    const userPerms = await this.getUserPermissions(user);
    return permissions.every(perm => userPerms.includes(perm));
  }

  // 獲取用戶所有權限（合併所有角色的權限）
  async getUserPermissions(user: AppUser | null): Promise<string[]> {
    if (!user || !user.roles || user.roles.length === 0) return [];
    
    const cacheKey = `${user.uid}_${user.roles.join(',')}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const perms = new Set<string>();
    for (const roleId of user.roles) {
      const rolePerms = await this.getRolePermissions(roleId);
      rolePerms.forEach(p => perms.add(p));
    }
    
    const result = Array.from(perms);
    this.permissionCache.set(cacheKey, result);
    return result;
  }

  // 獲取單一角色的權限
  private async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      const ref = doc(this.firestore, 'roles', roleId);
      const snap = await getDoc(ref);
      const data = snap.data();
      return Array.isArray(data?.['permissions']) ? data['permissions'] : [];
    } catch (error) {
      console.warn(`Failed to get permissions for role ${roleId}:`, error);
      return [];
    }
  }

  // 獲取用戶身分列表
  async getUserIdentity(user: AppUser | null): Promise<string[]> {
    if (!user || !user.roles || user.roles.length === 0) return [];
    const identities = new Set<string>();
    
    for (const roleId of user.roles) {
      const ref = doc(this.firestore, 'roles', roleId);
      const snap = await getDoc(ref);
      const data = snap.data();
      if (data?.['identity']) {
        if (Array.isArray(data['identity'])) {
          data['identity'].forEach((id: string) => identities.add(id));
        } else {
          identities.add(data['identity']);
        }
      }
    }
    return Array.from(identities);
  }

  // 清除權限快取
  clearCache(): void {
    this.permissionCache.clear();
  }

  // 清除特定用戶的權限快取
  clearUserCache(user: AppUser): void {
    const cacheKey = `${user.uid}_${user.roles.join(',')}`;
    this.permissionCache.delete(cacheKey);
  }
}
