// 本服務為合約時間線生成服務
// 功能：整合合約、變更、請款事件，產生時間軸資料
// 用途：合約管理的活動追蹤與歷史記錄顯示
import { Injectable } from '@angular/core';
import { Contract, TimelineEvent } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractTimelineService {

  generateTimeline(contract: Contract): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // 合約建立事件
    if (contract.orderDate) {
      events.push({
        label: `合約建立：${contract.projectName}`,
        date: contract.orderDate,
        type: 'contract',
        severity: 'info'
      });
    }

    // 變更事件
    if (contract.changes) {
      contract.changes.forEach(change => {
        events.push({
          label: `金額${change.type}：${change.amount.toLocaleString()} 元`,
          date: change.date,
          type: 'change',
          severity: change.type === '追加' ? 'success' : 'warning'
        });
      });
    }

    // 請款事件
    if (contract.payments) {
      contract.payments.forEach(payment => {
        const severity = this.getPaymentSeverity(payment.status);
        events.push({
          label: `第${payment.round}次請款：${payment.amount.toLocaleString()} 元 (${payment.status})`,
          date: payment.date,
          type: 'payment',
          severity
        });
      });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  generateGlobalTimeline(contracts: Contract[]): TimelineEvent[] {
    const allEvents: TimelineEvent[] = [];

    contracts.forEach(contract => {
      const contractEvents = this.generateTimeline(contract);
      allEvents.push(...contractEvents);
    });

    return allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  generateTimelineEvents(contracts: Contract[]): TimelineEvent[] {
    return this.generateGlobalTimeline(contracts);
  }

  getEventIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'contract': 'pi pi-file',
      'change': 'pi pi-pencil',
      'payment': 'pi pi-wallet'
    };
    return iconMap[type] || 'pi pi-circle';
  }

  getEventColor(severity?: string): string {
    const colorMap: Record<string, string> = {
      'success': '#10b981',
      'info': '#3b82f6',
      'warning': '#f59e0b',
      'danger': '#ef4444'
    };
    return colorMap[severity || 'info'] || '#6b7280';
  }

  getEventTypeLabel(type: string): string {
    const labelMap: Record<string, string> = {
      'contract': '合約',
      'change': '變更',
      'payment': '請款'
    };
    return labelMap[type] || type;
  }

  private getPaymentSeverity(status: any): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      '完成': 'success',
      '待審核': 'info',
      '待放款': 'info',
      '放款中': 'warning',
      '拒絕': 'danger',
      '草稿': 'info'
    };
    return severityMap[status] || 'info';
  }

  getPaymentLogSeverity(action: string): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      '送出': 'info',
      '撤回': 'warning',
      '下一步': 'success',
      '拒絕': 'danger',
      '重新申請': 'info'
    };
    return severityMap[action] || 'info';
  }
}