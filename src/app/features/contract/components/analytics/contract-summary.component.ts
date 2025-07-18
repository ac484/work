// 本元件為合約總覽摘要
// 功能：顯示合約總數
// 用途：合約管理主畫面的統計資訊顯示
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Contract } from '../../models';

@Component({
  selector: 'app-contract-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-xs text-gray-600">
      共 {{ contracts.length }} 筆合約
    </div>
  `
})
export class ContractSummaryComponent {
  @Input() contracts: Contract[] = [];
}