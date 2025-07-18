// 本服務為合約分析與統計服務
// 功能：進度計算、狀態分析、事件日誌、統計資料生成
// 用途：合約管理的數據分析與報表功能
import { Injectable } from '@angular/core';
import { Contract, PaymentRecord, TimelineEvent } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractAnalyticsService {
  
  calculateAnalytics(contracts: Contract[]) {
    return {
      total: contracts.length,
      statusDistribution: this.getStatusDistribution(contracts),
      paymentSummary: this.getPaymentSummary(contracts)
    };
  }

  getStatusDistribution(contracts: Contract[]) {
    const distribution = {
      '進行中': 0,
      '已完成': 0,
      '已終止': 0
    };
    
    contracts.forEach(contract => {
      distribution[contract.status]++;
    });
    
    return distribution;
  }

  getPaymentSummary(contracts: Contract[]) {
    let totalAmount = 0;
    let completedAmount = 0;
    let pendingAmount = 0;
    
    contracts.forEach(contract => {
      totalAmount += contract.contractAmount;
      const completedPayments = contract.payments?.filter(p => p.status === '完成') || [];
      completedAmount += completedPayments.reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = contract.payments?.filter(p => p.status !== '完成' && p.status !== '拒絕') || [];
      pendingAmount += pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    });
    
    return {
      totalAmount,
      completedAmount,
      pendingAmount,
      completionRate: totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0
    };
  }

  getProgressSummary(contract: Contract) {
    if (!contract.payments || contract.payments.length === 0) {
      return {
        notStarted: { count: 1, percent: 100 },
        inProgress: { count: 0, percent: 0 },
        completed: { count: 0, percent: 0 }
      };
    }

    const totalAmount = contract.contractAmount;
    if (totalAmount <= 0) {
      return {
        notStarted: { count: 1, percent: 100 },
        inProgress: { count: 0, percent: 0 },
        completed: { count: 0, percent: 0 }
      };
    }

    const completedPayments = contract.payments.filter(p => p.status === '完成');
    const inProgressPayments = contract.payments.filter(p => p.status && !['完成', '拒絕'].includes(p.status));
    
    const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const inProgressAmount = inProgressPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaymentAmount = contract.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const completedPercent = Math.round((completedAmount / totalAmount) * 100);
    const inProgressPercent = Math.round((inProgressAmount / totalAmount) * 100);
    const notStartedPercent = Math.max(0, 100 - Math.round((totalPaymentAmount / totalAmount) * 100));
    const notStartedCount = notStartedPercent > 0 ? 1 : 0;

    return {
      notStarted: { count: notStartedCount, percent: notStartedPercent },
      inProgress: { count: inProgressPayments.length, percent: inProgressPercent },
      completed: { count: completedPayments.length, percent: completedPercent }
    };
  }

  getStatusPercent(contract: Contract, status: PaymentRecord['status']): number {
    if (!contract.payments || contract.payments.length === 0) return 0;
    
    const statusPayments = contract.payments.filter(p => p.status === status);
    const totalAmount = contract.contractAmount;
    
    if (totalAmount <= 0) return 0;
    
    const statusAmount = statusPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return Math.round((statusAmount / totalAmount) * 100);
  }

  getEventLog(contract: Contract): string[] {
    const changeLogs = (contract.changes || []).map(c => ({
      label: `[變更][${c.type}]${c.amount.toLocaleString()} 元` + (c.note ? ` [備註]：${c.note}` : ''),
      date: c.date
    }));

    const paymentLogs = (contract.payments || []).map(p => ({
      label: `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
        (p.date ? ` 日期${p.date.slice(0, 10)}` : '') +
        (p.note ? ` 備註${p.note}` : ''),
      date: p.date || ''
    }));

    const allLogs = [...changeLogs, ...paymentLogs].sort((a, b) => a.date.localeCompare(b.date));
    return allLogs.map(l => l.label);
  }
}