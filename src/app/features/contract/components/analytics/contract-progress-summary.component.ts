// 本元件用於顯示單一合約的進度摘要
// 功能：計算進度百分比
// 用途：合約列表的進度顯示
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Contract } from '../../models';

@Component({
  selector: 'app-progress-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-xs">
      <span class="text-gray-600">完成: {{ completedPercent }}%</span>
    </div>
  `
})
export class ProgressSummaryComponent {
  @Input() contract!: Contract;

  get completedPercent(): number {
    if (!this.contract.payments || !Array.isArray(this.contract.payments) || this.contract.payments.length === 0) {
      return 0;
    }
    
    const totalAmount = this.contract.contractAmount;
    if (totalAmount <= 0) return 0;
    
    const completedPayments = this.contract.payments.filter(p => p && p.status === '完成');
    const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return Math.round((completedAmount / totalAmount) * 100);
  }
}