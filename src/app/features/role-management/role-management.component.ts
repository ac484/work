// 🚨 此元件已重構至 IAM 模組
// 新路徑: src/app/features/iam/components/roles/role-list.component.ts
// 請使用新的 IAM 模組進行角色管理

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="migration-notice bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div class="flex flex-col items-center">
        <i class="pi pi-exclamation-triangle text-4xl text-yellow-600 mb-4"></i>
        <h2 class="text-xl font-bold text-yellow-800 mb-2">元件已遷移</h2>
        <p class="text-yellow-700 mb-4">
          此角色管理元件已重構至新的 IAM 模組，提供更完整的功能和更好的用戶體驗。
        </p>
        <div class="bg-white p-4 rounded border mb-4">
          <h3 class="font-semibold mb-2">新功能包括：</h3>
          <ul class="text-left text-sm space-y-1">
            <li>• 現代化的 UI 設計</li>
            <li>• 權限矩陣視圖</li>
            <li>• 進階篩選和搜尋</li>
            <li>• 批量操作功能</li>
            <li>• 權限監控和審計</li>
          </ul>
        </div>
        <button 
          (click)="navigateToNewRoleManagement()"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
          前往新的角色管理
        </button>
      </div>
    </div>
  `
})
export class RoleManagementComponent {
  private router = inject(Router);

  navigateToNewRoleManagement(): void {
    this.router.navigate(['/iam/roles']);
  }
}
