// 🚨 此元件已重構至 IAM 模組
// 新路徑: src/app/features/iam/components/permissions/permission-monitor.component.ts
// 請使用新的 IAM 模組進行權限監控

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permission-monitor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="migration-notice bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div class="flex flex-col items-center">
        <i class="pi pi-exclamation-triangle text-4xl text-yellow-600 mb-4"></i>
        <h2 class="text-xl font-bold text-yellow-800 mb-2">元件已遷移</h2>
        <p class="text-yellow-700 mb-4">
          此權限監控元件已重構至新的 IAM 模組，提供更完整的功能和更好的用戶體驗。
        </p>
        <div class="bg-white p-4 rounded border mb-4">
          <h3 class="font-semibold mb-2">新功能包括：</h3>
          <ul class="text-left text-sm space-y-1">
            <li>• 實時權限監控儀表板</li>
            <li>• 權限矩陣視圖</li>
            <li>• 詳細的審計記錄</li>
            <li>• 權限統計分析</li>
            <li>• 匯出和報告功能</li>
          </ul>
        </div>
        <div class="flex gap-2">
          <button 
            (click)="navigateToPermissionMonitor()"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            權限監控
          </button>
          <button 
            (click)="navigateToPermissionMatrix()"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            權限矩陣
          </button>
        </div>
      </div>
    </div>
  `
})
export class PermissionMonitorDashboardComponent {
  private router = inject(Router);

  navigateToPermissionMonitor(): void {
    this.router.navigate(['/iam/permissions/monitor']);
  }

  navigateToPermissionMatrix(): void {
    this.router.navigate(['/iam/permissions/matrix']);
  }
} 