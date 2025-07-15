// IAM 門面服務 - 統一的業務邏輯入口
// 功能：整合所有 IAM 相關服務，提供統一 API
// 用途：外部模組的單一依賴點，隱藏內部複雜性

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';

// 服務依賴
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';
import { RoleService } from '../roles/role.service';
import { PermissionService } from '../permissions/permission.service';

// 模型
import { User, UserFilter, UserListItem } from '../../models/user.model';
import { Role, RoleFilter, RoleListItem } from '../../models/role.model';
import { AuthUser, AuthState } from '../../models/auth.model';
import { PermissionCheck } from '../../models/permission.model';

@Injectable({ providedIn: 'root' })
export class IamFacadeService {
  // 注入專門服務
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);

  // 狀態管理
  private selectedUserId$ = new BehaviorSubject<string | null>(null);
  private selectedRoleId$ = new BehaviorSubject<string | null>(null);

  // 快取資料流
  private users$ = this.userService.getUsers().pipe(shareReplay(1));
  private roles$ = this.roleService.getRoles().pipe(shareReplay(1));
  private currentUser$ = this.authService.getCurrentUser().pipe(shareReplay(1));

  // ===== 認證相關 API =====
  
  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$;
  }

  getAuthState(): Observable<AuthState> {
    return this.authService.getAuthState();
  }

  async login(email: string, password: string): Promise<void> {
    return this.authService.login(email, password);
  }

  async logout(): Promise<void> {
    return this.authService.logout();
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    return this.authService.register(email, password, displayName);
  }

  async loginWithGoogle(): Promise<void> {
    return this.authService.loginWithGoogle();
  }

  async resetPassword(email: string): Promise<void> {
    return this.authService.resetPassword(email);
  }

  // ===== 用戶管理 API =====
  
  getUsers(filter?: UserFilter): Observable<UserListItem[]> {
    return this.users$.pipe(
      map(users => this.userService.filterUsers(users, filter))
    );
  }

  getUserById(uid: string): Observable<User | undefined> {
    return this.users$.pipe(
      map(users => users.find(u => u.uid === uid)),
      distinctUntilChanged()
    );
  }

  setSelectedUser(uid: string | null): void {
    this.selectedUserId$.next(uid);
  }

  getSelectedUserId(): Observable<string | null> {
    return this.selectedUserId$.pipe(distinctUntilChanged());
  }

  getSelectedUser(): Observable<User | undefined> {
    return combineLatest([this.users$, this.selectedUserId$]).pipe(
      map(([users, selectedId]) => 
        selectedId ? users.find(u => u.uid === selectedId) : undefined
      ),
      distinctUntilChanged()
    );
  }

  async createUser(userData: Partial<User>): Promise<void> {
    return this.userService.createUser(userData);
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<void> {
    return this.userService.updateUser(uid, userData);
  }

  async deleteUser(uid: string): Promise<void> {
    return this.userService.deleteUser(uid);
  }

  async assignRolesToUser(uid: string, roleIds: string[]): Promise<void> {
    return this.userService.assignRoles(uid, roleIds);
  }

  // ===== 角色管理 API =====
  
  getRoles(filter?: RoleFilter): Observable<RoleListItem[]> {
    return this.roles$.pipe(
      map(roles => this.roleService.filterRoles(roles, filter))
    );
  }

  getRoleById(roleId: string): Observable<Role | undefined> {
    return this.roles$.pipe(
      map(roles => roles.find(r => r.id === roleId)),
      distinctUntilChanged()
    );
  }

  setSelectedRole(roleId: string | null): void {
    this.selectedRoleId$.next(roleId);
  }

  getSelectedRoleId(): Observable<string | null> {
    return this.selectedRoleId$.pipe(distinctUntilChanged());
  }

  getSelectedRole(): Observable<Role | undefined> {
    return combineLatest([this.roles$, this.selectedRoleId$]).pipe(
      map(([roles, selectedId]) => 
        selectedId ? roles.find(r => r.id === selectedId) : undefined
      ),
      distinctUntilChanged()
    );
  }

  async createRole(roleData: Partial<Role>): Promise<void> {
    return this.roleService.createRole(roleData);
  }

  async updateRole(roleId: string, roleData: Partial<Role>): Promise<void> {
    return this.roleService.updateRole(roleId, roleData);
  }

  async deleteRole(roleId: string): Promise<void> {
    return this.roleService.deleteRole(roleId);
  }

  // ===== 權限管理 API =====
  
  async checkPermission(permission: string, resource?: string, resourceId?: string): Promise<boolean> {
    return this.permissionService.checkPermission(permission, resource, resourceId);
  }

  getUserPermissions(uid: string): Observable<string[]> {
    return this.permissionService.getUserPermissions(uid);
  }

  getRolePermissions(roleId: string): Observable<string[]> {
    return this.permissionService.getRolePermissions(roleId);
  }

  getPermissionChecks(): Observable<PermissionCheck[]> {
    return this.permissionService.getPermissionChecks();
  }

  // ===== 統合查詢 API =====
  
  getUsersWithRoles(): Observable<(User & { roleNames: string[] })[]> {
    return combineLatest([this.users$, this.roles$]).pipe(
      map(([users, roles]) => 
        users.map(user => ({
          ...user,
          roleNames: user.roles
            .map(roleId => roles.find(r => r.id === roleId)?.name)
            .filter(Boolean) as string[]
        }))
      )
    );
  }

  getRolesWithUserCount(): Observable<(Role & { userCount: number })[]> {
    return combineLatest([this.roles$, this.users$]).pipe(
      map(([roles, users]) => 
        roles.map(role => ({
          ...role,
          userCount: users.filter(user => user.roles.includes(role.id)).length
        }))
      )
    );
  }

  // ===== 快速操作 API =====
  
  async toggleUserStatus(uid: string): Promise<void> {
    const user = await this.getUserById(uid).pipe(map(u => u)).toPromise();
    if (user) {
      await this.updateUser(uid, { isActive: !user.isActive });
    }
  }

  async bulkAssignRole(userIds: string[], roleId: string): Promise<void> {
    const promises = userIds.map(uid => 
      this.getUserById(uid).pipe(
        map(user => user ? this.assignRolesToUser(uid, [...user.roles, roleId]) : Promise.resolve())
      ).toPromise()
    );
    await Promise.all(promises);
  }

  async bulkRemoveRole(userIds: string[], roleId: string): Promise<void> {
    const promises = userIds.map(uid => 
      this.getUserById(uid).pipe(
        map(user => user ? this.assignRolesToUser(uid, user.roles.filter(r => r !== roleId)) : Promise.resolve())
      ).toPromise()
    );
    await Promise.all(promises);
  }
}