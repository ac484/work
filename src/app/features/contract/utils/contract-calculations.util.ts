// 合約計算相關的純函數工具
import { Contract, PaymentRecord } from '../models';

export class ContractCalculations {
  
  static calculateNetChange(contract: Contract): number {
    return (contract.changes ?? []).reduce((sum, c) => 
      sum + (c.type === '追加' ? c.amount : -c.amount), 0
    );
  }

  static calculateOriginalAmount(contract: Contract): number {
    return contract.contractAmount - this.calculateNetChange(contract);
  }

  static calculateCompletedAmount(contract: Contract): number {
    const completedPayments = contract.payments?.filter(p => p.status === '完成') || [];
    return completedPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  static calculatePendingAmount(contract: Contract): number {
    const pendingPayments = contract.payments?.filter(p => 
      p.status && !['完成', '拒絕'].includes(p.status)
    ) || [];
    return pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  static calculateCompletionRate(contract: Contract): number {
    if (contract.contractAmount <= 0) return 0;
    const completedAmount = this.calculateCompletedAmount(contract);
    return Math.round((completedAmount / contract.contractAmount) * 100);
  }

  static getNextPaymentRound(contract: Contract): number {
    return (contract.payments?.length || 0) + 1;
  }
}