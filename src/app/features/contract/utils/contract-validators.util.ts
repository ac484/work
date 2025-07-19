// 合約驗證相關的純函數工具
import { Contract } from '../models';

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

  static validateContractCode(code: string): { valid: boolean; message?: string } {
    if (!code) {
      return { valid: false, message: '合約編號不能為空' };
    }
    
    if (!/^C\d{3,}$/.test(code)) {
      return { valid: false, message: '合約編號格式不正確，應為 C001 格式' };
    }
    
    return { valid: true };
  }
}