// 權限監控服務 - 監控和統計權限檢查
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PermissionService } from './permission.service';
import { PermissionCheck } from '../../models/permission.model';
import { ROUTE_PERMISSION_MAPPING, RoutePermissionConfig, getRoutePermissionConfig } from '../../../../core/constants/permissions';

interface PermissionStats {
  totalChecks: number;
  grantedChecks: number;
  deniedChecks: number;
}

@Injectable({ providedIn: 'root' })
export class PermissionMonitorService {
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  // 權限統計信號
  private permissionStats = signal<PermissionStats>({
    totalChecks: 0,
    grantedChecks: 0,
    deniedChecks: 0
  });

  // 當前路由配置信號
  private currentRouteConfig = signal<RoutePermissionConfig | null>(null);

  constructor() {
    // 監聽路由變化
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      const config = getRoutePermissionConfig(currentUrl);
      this.currentRouteConfig.set(config || null);
    });

    // 監聽權限檢查事件並更新統計
    this.permissionService.getPermissionChecks().subscribe(checks => {
      this.updateStats(checks);
    });
  }

  getPermissionEvents(): Observable<PermissionCheck[]> {
    return this.permissionService.getPermissionChecks();
  }

  getPermissionStats() {
    return this.permissionStats;
  }

  getCurrentRouteConfig() {
    return this.currentRouteConfig;
  }

  clearPermissionEvents(): void {
    // 重置統計
    this.permissionStats.set({
      totalChecks: 0,
      grantedChecks: 0,
      deniedChecks: 0
    });
  }

  private updateStats(checks: PermissionCheck[]): void {
    const stats = {
      totalChecks: checks.length,
      grantedChecks: checks.filter(c => c.granted).length,
      deniedChecks: checks.filter(c => !c.granted).length
    };
    this.permissionStats.set(stats);
  }
}