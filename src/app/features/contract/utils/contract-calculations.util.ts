// 合約計算相關的純函數工具
import { Contract } from '../models';

export class ContractCalculations {
  
  static calculateNetChange(contract: Contract): number {
    return (contract.changes ?? []).reduce((sum, c) => 
      sum + (c.type === '追加' ? c.amount : -c.amount), 0
    );
  }

  static calculateCompletedAmount(contract: Contract): number {
    const completedPayments = contract.payments?.filter(p => p.status === '完成') || [];
    return completedPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  static calculateCompletionRate(contract: Contract): number {
    if (contract.contractAmount <= 0) return 0;
    const completedAmount = this.calculateCompletedAmount(contract);
    return Math.round((completedAmount / contract.contractAmount) * 100);
  }
}