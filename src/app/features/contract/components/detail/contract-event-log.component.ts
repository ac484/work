// 本元件用於顯示單一合約的事件日誌
// 功能：列出所有變更、請款等事件紀錄，支援滾動
// 用途：合約詳情頁的事件追蹤區塊
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from '../../models';
import { ContractAnalyticsService } from '../../services/analytics/contract-analytics.service';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="contract; else emptyBlock" class="h-full flex flex-col">
      <div class="flex-1 overflow-auto">
        <div *ngFor="let log of getLogs()" class="text-xs mb-1">{{ log }}</div>
      </div>
    </div>
    <ng-template #emptyBlock>
      <div class="flex flex-col justify-center items-center h-full text-gray-400 min-h-[150px]">
        <i class="pi pi-calendar text-3xl mb-3"></i>
        <div class="text-sm text-center font-medium mb-1">請選擇合約</div>
        <div class="text-xs text-center text-gray-300">檢視事件紀錄</div>
      </div>
    </ng-template>
  `
})
export class EventLogComponent {
  @Input() contract: Contract | null = null;
  constructor(private analytics: ContractAnalyticsService) {}
  getLogs(): string[] {
    return this.contract ? this.analytics.getEventLog(this.contract) : [];
  }
}