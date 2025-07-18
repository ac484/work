// 本檔案依據 Firebase Console 專案設定，使用 Firebase Functions
// 功能：Firebase Functions 整合服務
// 用途：統一管理所有合約相關的 Firebase Functions 呼叫

import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Contract, PaymentRecord } from '../models';
import { AppUser } from '../../../core/services/iam/users/user.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseFunctionsService {
  private functions = inject(Functions);

  // 合約流水號生成
  async generateContractCode(): Promise<string> {
    const generateCode = httpsCallable(this.functions, 'generateContractCode');
    const result = await generateCode({});
    return (result.data as any).code;
  }

  // 請款申請建立
  async createPaymentRequest(
    contractId: string,
    amount: number,
    percent: number,
    note: string,
    user: AppUser
  ): Promise<PaymentRecord> {
    const createPayment = httpsCallable(this.functions, 'createPaymentRequest');
    const result = await createPayment({
      contractId,
      amount,
      percent,
      note,
      userId: user.uid,
      userDisplayName: user.displayName || user.email || '未知用戶'
    });
    
    if (!(result.data as any).success) {
      throw new Error((result.data as any).error);
    }
    
    return (result.data as any).paymentRecord;
  }

  // 請款狀態轉移
  async executePaymentAction(
    contractId: string,
    paymentRound: number,
    action: '送出' | '撤回' | '下一步' | '拒絕' | '重新申請',
    user: AppUser
  ): Promise<string> {
    const executeAction = httpsCallable(this.functions, 'executePaymentAction');
    const result = await executeAction({
      contractId,
      paymentRound,
      action,
      userId: user.uid,
      userDisplayName: user.displayName || user.email || '未知用戶'
    });
    
    if (!(result.data as any).success) {
      throw new Error((result.data as any).error);
    }
    
    return (result.data as any).newStatus;
  }

  // 合約變更管理
  async addContractChange(
    contractId: string,
    type: '追加' | '追減',
    amount: number,
    note: string,
    user: AppUser
  ): Promise<number> {
    const addChange = httpsCallable(this.functions, 'addContractChange');
    const result = await addChange({
      contractId,
      type,
      amount,
      note,
      userId: user.uid,
      userDisplayName: user.displayName || user.email || '未知用戶'
    });
    
    if (!(result.data as any).success) {
      throw new Error((result.data as any).error);
    }
    
    return (result.data as any).newAmount;
  }

  // 合約驗證
  async validateContract(
    contractData: Partial<Contract>,
    validationType: 'create' | 'update' | 'code' | 'amount'
  ): Promise<{ valid: boolean; errors: string[]; warnings?: string[] }> {
    const validate = httpsCallable(this.functions, 'validateContract');
    const result = await validate({
      contractData,
      validationType
    });
    
    return result.data as any;
  }

  // 自動進度計算
  async calculateContractProgress(contractId: string): Promise<any> {
    const calculateProgress = httpsCallable(this.functions, 'calculateContractProgress');
    const result = await calculateProgress({ contractId });
    
    if (!(result.data as any).success) {
      throw new Error((result.data as any).error);
    }
    
    return (result.data as any).progress;
  }

  // 批量重新計算所有合約進度
  async calculateAllContractsProgress(): Promise<any> {
    const calculateAll = httpsCallable(this.functions, 'calculateAllContractsProgress');
    const result = await calculateAll({});
    
    if (!(result.data as any).success) {
      throw new Error((result.data as any).error);
    }
    
    return (result.data as any).results;
  }
} 