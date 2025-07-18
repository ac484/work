// 本元件為合約總覽摘要
// 功能：統計未開始、進行中、已完成合約數量與百分比
// 用途：合約管理主畫面的統計資訊顯示
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Contract } from '../../models';
import { ContractSummaryService } from '../../services/analytics/contract-summary.service';

@Component({
  selector: 'app-contract-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-4 text-xs">
      <span class="text-gray-600">未開始: {{ notStarted.count }} ({{ notStarted.percent }}%)</span>
      <span class="text-blue-600">進行中: {{ inProgress.count }} ({{ inProgress.percent }}%)</span>
      <span class="text-green-600">已完成: {{ completed.count }} ({{ completed.percent }}%)</span>
    </div>
  `
})
export class ContractSummaryComponent {
  @Input() contracts: Contract[] = [];
  constructor(private summaryService: ContractSummaryService) {}
  get notStarted() {
    return this.summary.notStarted;
  }
  get inProgress() {
    return this.summary.inProgress;
  }
  get completed() {
    return this.summary.completed;
  }
  private get summary() {
    return this.summaryService.getOverallSummary(this.contracts);
  }
}