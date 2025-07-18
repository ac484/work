// 合約驗證相關的純函數工具
import { Contract, PaymentRecord, PaymentAction } from '../models';

export class ContractValidators {
  
  static isValidContract(contract: Partial<Contract>): boolean {
    return !!(
      contract.code &&
      contract.client &&
      contract.projectName &&
      contract.contractAmount &&
      contract.contractAmount > 0
    );
  }

  static isValidPaymentAmount(amount: number, contractAmount: number): boolean {
    return amount > 0 && amount <= contractAmount;
  }

  static isValidPaymentPercent(percent: number): boolean {
    return percent > 0 && percent <= 100;
  }

  static canAddPayment(contract: Contract): boolean {
    if (!contract.payments) return true;
    
    // 檢查是否有未完成的請款
    const pendingPayments = contract.payments.filter(p => 
      p.status && !['完成', '拒絕'].includes(p.status)
    );
    
    return pendingPayments.length === 0;
  }

  static isPaymentActionValid(payment: PaymentRecord, action: PaymentAction): boolean {
    // 這裡可以加入更複雜的業務邏輯驗證
    return true;
  }

  static validateContractCode(code: string): { valid: boolean; message?: string } {
    if (!code) {
      return { valid: false, message: '合約編號不能為空' };
    }
    
    if (!/^C\d{3,}$/.test(code)) {
      return { valid: false, message: '合約編號格式不正確，應為 C001 格式' };
    }
    
    return { valid: true };
  }

  static validateProjectInfo(projectName: string, projectNo?: string): { valid: boolean; message?: string } {
    if (!projectName?.trim()) {
      return { valid: false, message: '專案名稱不能為空' };
    }
    
    if (projectName.length > 100) {
      return { valid: false, message: '專案名稱不能超過100個字符' };
    }
    
    return { valid: true };
  }
}