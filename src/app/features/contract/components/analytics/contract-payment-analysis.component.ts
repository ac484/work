// 本元件用於顯示單一合約的請款狀態分析
// 功能：各狀態百分比進度條，顯示拒絕比例
// 用途：合約詳情頁的請款進度分析
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract, PaymentRecord, PaymentStatus } from '../../models';
import { ContractAnalyticsService } from '../../services/analytics/contract-analytics.service';

@Component({
  selector: 'app-payment-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="contract; else emptyBlock">
      <div class="flex flex-col gap-1 mb-2">
        <div *ngFor="let status of statusList" class="flex items-center mb-1">
          <span class="text-xs mr-2 w-14">{{ status }}</span>
          <progress [value]="getPercent(status)" max="100" class="flex-1 h-2 bg-gray-200"></progress>
          <span class="text-xs ml-2 w-10 text-right">{{ getPercent(status) }}%</span>
        </div>
        <div *ngIf="getPercent('拒絕') > 0" class="text-xs text-red-600 mt-1">
          拒絕: {{ getPercent('拒絕') }}%（退件不計入流程進度）
        </div>
      </div>
    </div>
    <ng-template #emptyBlock>
      <div class="text-xs text-gray-400 p-2">請選擇合約以檢視請款分析</div>
    </ng-template>
  `
})
export class PaymentAnalysisComponent {
  @Input() contract: Contract | null = null;
  
  statusList: PaymentStatus[] = ['草稿', '待審核', '待放款', '放款中', '完成'];
  
  constructor(private analytics: ContractAnalyticsService) {}
  
  getPercent(status: PaymentStatus): number {
    return this.contract ? this.analytics.getStatusPercent(this.contract, status) : 0;
  }
}