// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { 
  Permission, 
  CrudOperation, 
  PermissionCheckEvent, 
  getRoutePermissionConfig, 
  getCrudPermissionRequirements,
  RoutePermissionConfig 
} from '../../../constants/permissions';
import { PermissionService } from './permission.service';
import { UserService, AppUser } from '../users/user.service';

@Injectable({ providedIn: 'root' })
export class PermissionMonitorService {
  private router = inject(Router);
  private permissionService = inject(PermissionService);
  private userService = inject(UserService);

  // 權限檢查事件流
  private permissionEvents$ = new BehaviorSubject<PermissionCheckEvent[]>([]);
  
  // 當前路由權限配置
  private currentRouteConfig = signal<RoutePermissionConfig | null>(null);
  
  // 權限檢查統計
  private permissionStats = signal({
    totalChecks: 0,
    deniedChecks: 0,
    grantedChecks: 0,
    lastCheck: null as Date | null
  });

  constructor() {
    this.initializeRouteMonitoring();
  }

  // 初始化路由監控
  private initializeRouteMonitoring(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      const config = getRoutePermissionConfig(event.url);
      this.currentRouteConfig.set(config || null);
    });
  }

  // 檢查路由權限
  async checkRoutePermission(
    route: string, 
    user: AppUser | null
  ): Promise<{ granted: boolean; reason?: string }> {
    const config = getRoutePermissionConfig(route);
    if (!config) {
      return { granted: true }; // 沒有配置的路由預設允許
    }

    if (!user) {
      this.logPermissionEvent({
        timestamp: new Date(),
        userId: 'anonymous',
        operation: 'read',
        resourceType: 'route',
        requiredPermissions: config.requiredPermissions,
        userPermissions: [],
        granted: false,
        route,
        reason: '用戶未登入'
      });
      return { granted: false, reason: '用戶未登入' };
    }

    const hasPermission = await this.permissionService.hasAnyPermission(
      user, 
      config.requiredPermissions
    );

    const userPermissions = await this.permissionService.getUserPermissions(user);
    
    this.logPermissionEvent({
      timestamp: new Date(),
      userId: user.uid,
      operation: 'read',
      resourceType: 'route',
      requiredPermissions: config.requiredPermissions,
      userPermissions: userPermissions as Permission[],
      granted: hasPermission,
      route,
      reason: hasPermission ? undefined : '權限不足'
    });

    return { 
      granted: hasPermission, 
      reason: hasPermission ? undefined : '權限不足' 
    };
  }

  // 檢查 CRUD 操作權限
  async checkCrudPermission(
    resourceType: string,
    operation: CrudOperation,
    user: AppUser | null,
    resourceId?: string,
    resourceOwnerId?: string
  ): Promise<{ granted: boolean; reason?: string }> {
    const requirements = getCrudPermissionRequirements(resourceType, operation);
    if (!requirements) {
      return { granted: true }; // 沒有配置的操作預設允許
    }

    if (!user) {
      this.logPermissionEvent({
        timestamp: new Date(),
        userId: 'anonymous',
        operation,
        resourceType,
        resourceId,
        requiredPermissions: requirements.requiredPermissions,
        userPermissions: [],
        granted: false,
        reason: '用戶未登入'
      });
      return { granted: false, reason: '用戶未登入' };
    }

    // 檢查基本權限
    const hasBasicPermission = await this.permissionService.hasAnyPermission(
      user, 
      requirements.requiredPermissions
    );

    if (!hasBasicPermission) {
             const userPermissions = await this.permissionService.getUserPermissions(user);
       this.logPermissionEvent({
         timestamp: new Date(),
         userId: user.uid,
         operation,
         resourceType,
         resourceId,
         requiredPermissions: requirements.requiredPermissions,
         userPermissions: userPermissions as Permission[],
         granted: false,
         reason: '權限不足'
       });
      return { granted: false, reason: '權限不足' };
    }

    // 檢查自操作限制
    if (requirements.allowSelfOperation === false && 
        resourceOwnerId && 
        resourceOwnerId === user.uid) {
      const userPermissions = await this.permissionService.getUserPermissions(user);
      this.logPermissionEvent({
        timestamp: new Date(),
        userId: user.uid,
        operation,
        resourceType,
        resourceId,
        requiredPermissions: requirements.requiredPermissions,
        userPermissions: userPermissions as Permission[],
        granted: false,
        reason: '不能操作自己的資源'
      });
      return { granted: false, reason: '不能操作自己的資源' };
    }

    const userPermissions2 = await this.permissionService.getUserPermissions(user);
    this.logPermissionEvent({
      timestamp: new Date(),
      userId: user.uid,
      operation,
      resourceType,
      resourceId,
      requiredPermissions: requirements.requiredPermissions,
      userPermissions: userPermissions2 as Permission[],
      granted: true
    });

    return { granted: true };
  }

  // 記錄權限檢查事件
  private logPermissionEvent(event: PermissionCheckEvent): void {
    const currentEvents = this.permissionEvents$.value;
    const updatedEvents = [event, ...currentEvents].slice(0, 100); // 保留最近100條記錄
    this.permissionEvents$.next(updatedEvents);

    // 更新統計
    const stats = this.permissionStats();
    this.permissionStats.set({
      totalChecks: stats.totalChecks + 1,
      deniedChecks: stats.deniedChecks + (event.granted ? 0 : 1),
      grantedChecks: stats.grantedChecks + (event.granted ? 1 : 0),
      lastCheck: event.timestamp
    });

    // 控制台輸出（開發環境）
    if (!event.granted) {
      console.warn('權限檢查失敗:', {
        user: event.userId,
        operation: event.operation,
        resource: event.resourceType,
        reason: event.reason,
        required: event.requiredPermissions,
        userHas: event.userPermissions
      });
    }
  }

  // 獲取權限事件流
  getPermissionEvents(): Observable<PermissionCheckEvent[]> {
    return this.permissionEvents$.asObservable();
  }

  // 獲取權限統計
  getPermissionStats() {
    return this.permissionStats.asReadonly();
  }

  // 獲取當前路由權限配置
  getCurrentRouteConfig() {
    return this.currentRouteConfig.asReadonly();
  }

  // 清除權限事件記錄
  clearPermissionEvents(): void {
    this.permissionEvents$.next([]);
    this.permissionStats.set({
      totalChecks: 0,
      deniedChecks: 0,
      grantedChecks: 0,
      lastCheck: null
    });
  }

  // 獲取用戶在特定資源類型的可用操作
  async getAvailableOperations(
    resourceType: string, 
    user: AppUser | null
  ): Promise<CrudOperation[]> {
    if (!user) return [];

    const operations: CrudOperation[] = ['create', 'read', 'update', 'delete'];
    const availableOps: CrudOperation[] = [];

    for (const operation of operations) {
      const result = await this.checkCrudPermission(resourceType, operation, user);
      if (result.granted) {
        availableOps.push(operation);
      }
    }

    return availableOps;
  }
} 