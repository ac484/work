// 本元件用於顯示單一合約的進度摘要與事件紀錄
// 功能：計算進度百分比、顯示事件日誌，支援顏色動態變化
// 用途：合約詳情頁的進度與事件摘要
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Contract } from '../../models';

@Component({
  selector: 'app-progress-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-1">
      <ng-container *ngFor="let item of summaryItems">
        <div *ngIf="item.data.percent > 0" class="flex items-center gap-2 whitespace-nowrap">
          <span class="font-bold">{{ item.label }} ({{ item.data.count }})</span>
          <span class="text-xs" [style.color]="getPercentColorByLabel(item.label, item.data.percent)">{{ item.data.percent }}%</span>
        </div>
      </ng-container>
      <div *ngIf="showEvents && contract">
        <div class="mt-2 text-xs text-gray-500">事件紀錄：</div>
        <div *ngFor="let log of getEventLog(contract)" class="text-xs">{{ log }}</div>
      </div>
    </div>
  `
})
export class ProgressSummaryComponent {
  @Input() contract!: Contract;
  @Input() showEvents = false;

  get summaryItems() {
    const s = this.getProgressSummary(this.contract);
    return [
      { label: '未開始', data: s.notStarted },
      { label: '進行中', data: s.inProgress },
      { label: '已完成', data: s.completed }
    ];
  }

  getProgressSummary(contract: Contract): {notStarted: {count: number, percent: number}, inProgress: {count: number, percent: number}, completed: {count: number, percent: number}} {
    if (!contract.payments || contract.payments.length === 0) {
      return {
        notStarted: {count: 1, percent: 100},
        inProgress: {count: 0, percent: 0},
        completed: {count: 0, percent: 0}
      };
    }
    const totalAmount = contract.contractAmount;
    if (totalAmount <= 0) {
      return {
        notStarted: {count: 1, percent: 100},
        inProgress: {count: 0, percent: 0},
        completed: {count: 0, percent: 0}
      };
    }
    const completedPayments = contract.payments.filter(p => p.status === '完成');
    const inProgressPayments = contract.payments.filter(p => p.status && !['完成', '已拒絕'].includes(p.status));
    const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const inProgressAmount = inProgressPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaymentAmount = contract.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedPercent = Math.round((completedAmount / totalAmount) * 100);
    const inProgressPercent = Math.round((inProgressAmount / totalAmount) * 100);
    const notStartedPercent = Math.max(0, 100 - Math.round((totalPaymentAmount / totalAmount) * 100));
    const notStartedCount = notStartedPercent > 0 ? 1 : 0;
    return {
      notStarted: {count: notStartedCount, percent: notStartedPercent},
      inProgress: {count: inProgressPayments.length, percent: inProgressPercent},
      completed: {count: completedPayments.length, percent: completedPercent}
    };
  }

  getPercentColorByLabel(label: string, percent: number): string {
    const p = Math.min(100, Math.max(0, percent));
    if (label === '未開始') {
      const hue = 120 - (p * 1.2);
      return `hsl(${hue}, 100%, 40%)`;
    }
    if (label === '進行中') {
      const start = { h: 0, s: 0, l: 70 };
      const end = { h: 280, s: 50, l: 60 };
      const hue = start.h + ((end.h - start.h) * p) / 100;
      const sat = start.s + ((end.s - start.s) * p) / 100;
      const lum = start.l + ((end.l - start.l) * p) / 100;
      return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lum.toFixed(1)}%)`;
    }
    return `hsl(${p * 1.2}, 100%, 40%)`;
  }

  getEventLog(contract: Contract): string[] {
    const changeLogs = (contract.changes || []).map(c => ({
      label: `[變更][${c.type}]${c.amount.toLocaleString()} 元` + (c.note ? ` [備註]：${c.note}` : ''),
      date: c.date
    }));
    const paymentLogs = (contract.payments || []).map(p => ({
      label:
        `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
        (p.date ? ` 日期${p.date.slice(0, 10)}` : '') +
        (p.note ? ` 備註${p.note}` : ''),
      date: p.date || ''
    }));
    const allLogs = [...changeLogs, ...paymentLogs].sort((a, b) => a.date.localeCompare(b.date));
    return allLogs.map(l => l.label);
  }
}