// 本元件用於顯示合約的原始金額、變更金額（追加/追減）、現行金額摘要
// 功能：計算並展示合約金額的變化情形，支援動態顯示
// 用途：合約管理介面中的金額摘要區塊
import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { Contract } from '../../models';

@Component({
  selector: 'app-amount-summary',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div>
      <div>原始: {{ originalAmount | number:'1.0-2' }}</div>
      <div>變更: {{ netChange | number:'1.0-2' }}</div>
      <div>現行: {{ contract.contractAmount | number:'1.0-2' }}</div>
    </div>
  `
})
export class AmountSummaryComponent {
  @Input() contract!: Contract;

  get netChange(): number {
    const changes = this.contract.changes && Array.isArray(this.contract.changes) ? this.contract.changes : [];
    return changes.reduce((sum, c) => {
      if (c && c.type && typeof c.amount === 'number') {
        return sum + (c.type === '追加' ? c.amount : -c.amount);
      }
      return sum;
    }, 0);
  }
  get originalAmount(): number {
    return this.contract.contractAmount - this.netChange;
  }
}