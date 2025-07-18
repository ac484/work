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
    
    // 變更事件 - 確保陣列存在且不為空
    if (contract.changes && Array.isArray(contract.changes) && contract.changes.length > 0) {
      contract.changes.forEach(change => {
        if (change && change.type && change.amount && change.date) {
          logs.push(`[變更] ${change.type} ${change.amount.toLocaleString()} 元 - ${change.date.slice(0, 10)}`);
        }
      });
    }
    
    // 請款事件 - 確保陣列存在且不為空
    if (contract.payments && Array.isArray(contract.payments) && contract.payments.length > 0) {
      contract.payments.forEach(payment => {
        if (payment && payment.round && payment.amount && payment.status && payment.date) {
          logs.push(`[請款] 第${payment.round}次 ${payment.amount.toLocaleString()} 元 (${payment.status}) - ${payment.date.slice(0, 10)}`);
        }
      });
    }
    
    return logs.sort((a, b) => {
      const dateA = a.split(' - ')[1];
      const dateB = b.split(' - ')[1];
      return dateB.localeCompare(dateA);
    });
  }
}