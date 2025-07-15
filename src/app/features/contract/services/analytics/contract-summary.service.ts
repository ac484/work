// 本服務為合約摘要統計服務
// 功能：計算合約狀態分佈、數量統計、百分比計算
// 用途：合約管理主畫面的統計資訊顯示
import { Injectable } from '@angular/core';
import { Contract } from '../../models';
import { ContractAnalyticsService } from './contract-analytics.service';

interface Summary { count: number; percent: number; }

@Injectable({
  providedIn: 'root'
})
export class ContractSummaryService {
  constructor(private analytics: ContractAnalyticsService) {}

  generateSummary(contracts: Contract[]) {
    return this.analytics.calculateAnalytics(contracts);
  }

  getOverallSummary(contracts: Contract[]): {
    notStarted: Summary;
    inProgress: Summary;
    completed: Summary;
  } {
    const total = contracts.length;
    if (total === 0) {
      return {
        notStarted: { count: 0, percent: 0 },
        inProgress: { count: 0, percent: 0 },
        completed: { count: 0, percent: 0 }
      };
    }

    const statusCounts = {
      notStarted: contracts.filter(c => c.status === '進行中' && (!c.payments || c.payments.length === 0)).length,
      inProgress: contracts.filter(c => c.status === '進行中' && c.payments && c.payments.length > 0).length,
      completed: contracts.filter(c => c.status === '已完成').length
    };

    return {
      notStarted: {
        count: statusCounts.notStarted,
        percent: Math.round((statusCounts.notStarted / total) * 100)
      },
      inProgress: {
        count: statusCounts.inProgress,
        percent: Math.round((statusCounts.inProgress / total) * 100)
      },
      completed: {
        count: statusCounts.completed,
        percent: Math.round((statusCounts.completed / total) * 100)
      }
    };
  }
}