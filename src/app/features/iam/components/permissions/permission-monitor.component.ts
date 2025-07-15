// 權限監控元件 - 重構現有的權限監控儀表板
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { PermissionMonitorService } from '../../services/permissions/permission-monitor.service';
import { PermissionCheck } from '../../models/permission.model';

@Component({
  selector: 'app-permission-monitor',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <div class="permission-monitor-container">
      <h2 class="text-2xl font-bold mb-4">權限監控</h2>
      
      <!-- 權限統計 -->
      <div class="stats-grid grid mb-4">
        <div class="col-12 md:col-3">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-chart-line text-4xl text-blue-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">總檢查次數</h4>
            <p class="text-2xl font-bold text-900">{{ permissionStats().totalChecks }}</p>
          </div>
        </div>
        
        <div class="col-12 md:col-3">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">通過檢查</h4>
            <p class="text-2xl font-bold text-900">{{ permissionStats().grantedChecks }}</p>
          </div>
        </div>
        
        <div class="col-12 md:col-3">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-times-circle text-4xl text-red-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">拒絕檢查</h4>
            <p class="text-2xl font-bold text-900">{{ permissionStats().deniedChecks }}</p>
          </div>
        </div>
        
        <div class="col-12 md:col-3">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-percentage text-4xl text-blue-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">成功率</h4>
            <p class="text-2xl font-bold text-900">{{ getSuccessRate() }}%</p>
          </div>
        </div>
      </div>

      <!-- 當前路由權限配置 -->
      <div class="bg-white p-4 border-round shadow-1 mb-4" *ngIf="currentRouteConfig()">
        <h3 class="text-lg font-semibold mb-3">當前路由權限配置</h3>
        <div class="grid">
          <div class="col-12 md:col-6">
            <label class="block text-900 font-medium mb-1">路徑</label>
            <p class="text-600">{{ currentRouteConfig()?.path }}</p>
          </div>
          <div class="col-12 md:col-6">
            <label class="block text-900 font-medium mb-1">描述</label>
            <p class="text-600">{{ currentRouteConfig()?.description }}</p>
          </div>
          <div class="col-12">
            <label class="block text-900 font-medium mb-1">必要權限</label>
            <div class="flex flex-wrap gap-1">
              <p-chip 
                *ngFor="let permission of currentRouteConfig()?.requiredPermissions" 
                [label]="permission">
              </p-chip>
            </div>
          </div>
          <div class="col-12" *ngIf="currentRouteConfig()?.crudOperations">
            <label class="block text-900 font-medium mb-2">CRUD 操作權限</label>
            <div class="grid">
              <div class="col-6 md:col-3" *ngIf="currentRouteConfig()?.crudOperations?.create">
                <strong>建立:</strong>
                <div class="flex flex-wrap gap-1 mt-1">
                  <p-chip 
                    *ngFor="let perm of currentRouteConfig()?.crudOperations?.create" 
                    [label]="perm"
                    severity="success">
                  </p-chip>
                </div>
              </div>
              <div class="col-6 md:col-3" *ngIf="currentRouteConfig()?.crudOperations?.read">
                <strong>讀取:</strong>
                <div class="flex flex-wrap gap-1 mt-1">
                  <p-chip 
                    *ngFor="let perm of currentRouteConfig()?.crudOperations?.read" 
                    [label]="perm"
                    severity="info">
                  </p-chip>
                </div>
              </div>
              <div class="col-6 md:col-3" *ngIf="currentRouteConfig()?.crudOperations?.update">
                <strong>更新:</strong>
                <div class="flex flex-wrap gap-1 mt-1">
                  <p-chip 
                    *ngFor="let perm of currentRouteConfig()?.crudOperations?.update" 
                    [label]="perm"
                    severity="warning">
                  </p-chip>
                </div>
              </div>
              <div class="col-6 md:col-3" *ngIf="currentRouteConfig()?.crudOperations?.delete">
                <strong>刪除:</strong>
                <div class="flex flex-wrap gap-1 mt-1">
                  <p-chip 
                    *ngFor="let perm of currentRouteConfig()?.crudOperations?.delete" 
                    [label]="perm"
                    severity="danger">
                  </p-chip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 權限檢查事件列表 -->
      <div class="bg-white border-round shadow-1">
        <div class="flex justify-content-between align-items-center p-4 border-bottom-1 surface-border">
          <h3 class="text-lg font-semibold">權限檢查事件</h3>
          <p-button 
            label="清除記錄" 
            icon="pi pi-trash"
            severity="danger"
            [outlined]="true"
            size="small"
            (onClick)="clearEvents()">
          </p-button>
        </div>
        
        <div class="p-4">
          <p-table 
            [value]="(permissionEvents$ | async) || []" 
            [paginator]="true" 
            [rows]="20"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="顯示 {first} 到 {last} 筆，共 {totalRecords} 筆"
            [rowsPerPageOptions]="[10, 20, 50]"
            styleClass="p-datatable-striped">
            
            <ng-template pTemplate="header">
              <tr>
                <th>時間</th>
                <th>用戶</th>
                <th>操作</th>
                <th>資源</th>
                <th>權限</th>
                <th>結果</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-event>
              <tr [class]="event.granted ? '' : 'bg-red-50'">
                <td>{{ formatTimestamp(event.timestamp) }}</td>
                <td>
                  <div class="flex align-items-center">
                    <p-avatar 
                      [label]="getInitials(event.userId)"
                      size="normal"
                      class="mr-2">
                    </p-avatar>
                    <span class="text-sm">{{ event.userId === 'anonymous' ? '未登入' : event.userId }}</span>
                  </div>
                </td>
                <td>
                  <p-tag 
                    [value]="event.operation"
                    severity="info">
                  </p-tag>
                </td>
                <td>
                  <div>
                    <div class="font-medium">{{ event.resourceType || '-' }}</div>
                    <div class="text-sm text-600" *ngIf="event.resourceId">ID: {{ event.resourceId }}</div>
                    <div class="text-sm text-600" *ngIf="event.route">路由: {{ event.route }}</div>
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <p-chip 
                      *ngFor="let perm of event.requiredPermissions" 
                      [label]="perm">
                    </p-chip>
                  </div>
                </td>
                <td>
                  <div>
                    <p-tag 
                      [value]="event.granted ? '通過' : '拒絕'"
                      [severity]="event.granted ? 'success' : 'danger'">
                    </p-tag>
                    <div class="text-sm text-600 mt-1" *ngIf="event.reason">
                      {{ event.reason }}
                    </div>
                  </div>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center py-4">
                  <i class="pi pi-info-circle text-4xl text-400 mb-3"></i>
                  <p class="text-600">暫無權限檢查事件</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `
})
export class PermissionMonitorComponent implements OnInit {
  private permissionMonitor = inject(PermissionMonitorService);
  
  permissionEvents$!: Observable<PermissionCheck[]>;
  permissionStats = this.permissionMonitor.getPermissionStats();
  currentRouteConfig = this.permissionMonitor.getCurrentRouteConfig();

  ngOnInit(): void {
    this.permissionEvents$ = this.permissionMonitor.getPermissionEvents();
  }

  getSuccessRate(): number {
    const stats = this.permissionStats();
    if (stats.totalChecks === 0) return 0;
    return Math.round((stats.grantedChecks / stats.totalChecks) * 100);
  }

  clearEvents(): void {
    this.permissionMonitor.clearPermissionEvents();
  }

  formatTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(timestamp);
  }

  getInitials(userId: string): string {
    if (userId === 'anonymous') return 'AN';
    return userId.substring(0, 2).toUpperCase();
  }
}