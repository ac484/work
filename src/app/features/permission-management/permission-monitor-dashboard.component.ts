// 本元件為權限監控儀表板
// 功能：顯示權限檢查事件、統計、路由權限配置
// 用途：管理員檢查權限流與審計記錄
// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PermissionMonitorService } from '../../core/services/iam/permissions/permission-monitor.service';
import { PermissionCheckEvent } from '../../core/constants/permissions';

@Component({
  selector: 'app-permission-monitor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="permission-monitor-dashboard p-4">
      <h3 class="text-xl font-bold mb-4">權限監控儀表板</h3>
      
      <!-- 權限統計 -->
      <div class="stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card bg-white rounded-lg shadow p-4">
          <h4 class="text-sm font-medium text-gray-600">總檢查次數</h4>
          <p class="text-2xl font-bold text-blue-600">{{ permissionStats().totalChecks }}</p>
        </div>
        
        <div class="stat-card bg-white rounded-lg shadow p-4">
          <h4 class="text-sm font-medium text-gray-600">通過檢查</h4>
          <p class="text-2xl font-bold text-green-600">{{ permissionStats().grantedChecks }}</p>
        </div>
        
        <div class="stat-card bg-white rounded-lg shadow p-4">
          <h4 class="text-sm font-medium text-gray-600">拒絕檢查</h4>
          <p class="text-2xl font-bold text-red-600">{{ permissionStats().deniedChecks }}</p>
        </div>
        
        <div class="stat-card bg-white rounded-lg shadow p-4">
          <h4 class="text-sm font-medium text-gray-600">成功率</h4>
          <p class="text-2xl font-bold text-blue-600">{{ getSuccessRate() }}%</p>
        </div>
      </div>

      <!-- 當前路由權限配置 -->
      <div class="current-route-config bg-white rounded-lg shadow p-4 mb-6" *ngIf="currentRouteConfig()">
        <h4 class="text-lg font-semibold mb-2">當前路由權限配置</h4>
        <div class="config-details">
          <p><strong>路徑:</strong> {{ currentRouteConfig()?.path }}</p>
          <p><strong>描述:</strong> {{ currentRouteConfig()?.description }}</p>
                     <p><strong>必要權限:</strong> {{ currentRouteConfig()?.requiredPermissions?.join(', ') }}</p>
          <div *ngIf="currentRouteConfig()?.crudOperations" class="mt-2">
            <p><strong>CRUD 操作權限:</strong></p>
            <ul class="ml-4 list-disc">
              <li *ngIf="currentRouteConfig()?.crudOperations?.create">
                建立: {{ currentRouteConfig()?.crudOperations?.create?.join(', ') }}
              </li>
              <li *ngIf="currentRouteConfig()?.crudOperations?.read">
                讀取: {{ currentRouteConfig()?.crudOperations?.read?.join(', ') }}
              </li>
              <li *ngIf="currentRouteConfig()?.crudOperations?.update">
                更新: {{ currentRouteConfig()?.crudOperations?.update?.join(', ') }}
              </li>
              <li *ngIf="currentRouteConfig()?.crudOperations?.delete">
                刪除: {{ currentRouteConfig()?.crudOperations?.delete?.join(', ') }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 權限檢查事件列表 -->
      <div class="permission-events bg-white rounded-lg shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-semibold">權限檢查事件 (最近 {{ maxEvents }} 條)</h4>
          <button 
            (click)="clearEvents()" 
            class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
            清除記錄
          </button>
        </div>
        
        <div class="events-list max-h-96 overflow-y-auto">
          <div 
            *ngFor="let event of permissionEvents$ | async; trackBy: trackByTimestamp" 
            class="event-item border-b border-gray-200 py-3 last:border-b-0"
            [class.bg-red-50]="!event.granted"
            [class.bg-green-50]="event.granted">
            
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        [class.bg-green-100]="event.granted"
                        [class.text-green-800]="event.granted"
                        [class.bg-red-100]="!event.granted"
                        [class.text-red-800]="!event.granted">
                    {{ event.granted ? '✓ 通過' : '✗ 拒絕' }}
                  </span>
                  
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {{ event.operation }}
                  </span>
                  
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {{ event.resourceType }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-1">
                  用戶: {{ event.userId === 'anonymous' ? '未登入' : event.userId }}
                  <span *ngIf="event.resourceId"> | 資源 ID: {{ event.resourceId }}</span>
                  <span *ngIf="event.route"> | 路由: {{ event.route }}</span>
                </p>
                
                <p class="text-xs text-gray-500 mb-1">
                  必要權限: {{ event.requiredPermissions.join(', ') }}
                </p>
                
                <p class="text-xs text-gray-500 mb-1">
                  用戶權限: {{ event.userPermissions.join(', ') || '無' }}
                </p>
                
                <p *ngIf="event.reason" class="text-xs text-red-600">
                  原因: {{ event.reason }}
                </p>
              </div>
              
              <div class="text-xs text-gray-400 ml-4">
                {{ formatTimestamp(event.timestamp) }}
              </div>
            </div>
          </div>
          
          <div *ngIf="(permissionEvents$ | async)?.length === 0" 
               class="text-center text-gray-500 py-8">
            暫無權限檢查事件
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionMonitorDashboardComponent {
  private permissionMonitor = inject(PermissionMonitorService);
  
  permissionEvents$: Observable<PermissionCheckEvent[]> = this.permissionMonitor.getPermissionEvents();
  permissionStats = this.permissionMonitor.getPermissionStats();
  currentRouteConfig = this.permissionMonitor.getCurrentRouteConfig();
  
  readonly maxEvents = 100;

  getSuccessRate(): number {
    const stats = this.permissionStats();
    if (stats.totalChecks === 0) return 0;
    return Math.round((stats.grantedChecks / stats.totalChecks) * 100);
  }

  clearEvents(): void {
    this.permissionMonitor.clearPermissionEvents();
  }

  trackByTimestamp(index: number, event: PermissionCheckEvent): string {
    return event.timestamp.toISOString();
  }

  formatTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(timestamp);
  }
} 