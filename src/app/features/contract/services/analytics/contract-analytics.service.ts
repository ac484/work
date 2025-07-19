// 本服務為合約分析服務
// 功能：基本的事件日誌生成
// 用途：合約詳情頁的事件追蹤
import { Injectable } from '@angular/core';
import { Contract } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractAnalyticsService {

  getEventLog(contract: Contract): string[] {
    const logs: string[] = [];
    
    // 變更事件
    if (contract.changes) {
      contract.changes.forEach(change => {
        logs.push(`[變更] ${change.type} ${change.amount.toLocaleString()} 元 - ${change.date.slice(0, 10)}`);
      });
    }
    
    // 請款事件
    if (contract.payments) {
      contract.payments.forEach(payment => {
        logs.push(`[請款] 第${payment.round}次 ${payment.amount.toLocaleString()} 元 (${payment.status}) - ${payment.date.slice(0, 10)}`);
      });
    }
    
    return logs.sort((a, b) => {
      const dateA = a.split(' - ')[1];
      const dateB = b.split(' - ')[1];
      return dateB.localeCompare(dateA);
    });
  }
}