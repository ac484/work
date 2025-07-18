// 本服務為請款操作流程服務
// 功能：狀態轉移、操作執行、提示文字生成
// 用途：請款流程的業務邏輯處理
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { PaymentRecord, PaymentAction, PaymentStatus, PAYMENT_STATUS_TRANSITIONS, Contract, PaymentLog } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentActionService {
  private firestore = inject(Firestore);

  getAvailableActions(payment: PaymentRecord): PaymentAction[] {
    const transitions = PAYMENT_STATUS_TRANSITIONS[payment.status];
    return transitions ? Object.keys(transitions) as PaymentAction[] : [];
  }

  canPerformAction(
    user: AppUser | null,
    userPermissions: string[],
    payment: PaymentRecord,
    action: PaymentAction
  ): boolean {
    if (!user) return false;

    // 檢查狀態轉移是否有效
    const transitions = PAYMENT_STATUS_TRANSITIONS[payment.status];
    return !!(transitions && transitions[action] !== undefined);
  }

  getActionTooltip(
    user: AppUser | null,
    userPermissions: string[],
    payment: PaymentRecord,
    action: PaymentAction
  ): string {
    if (!user) return '請先登入';

    const transitions = PAYMENT_STATUS_TRANSITIONS[payment.status];
    if (!transitions || transitions[action] === undefined) {
      return '當前狀態不支援此操作';
    }

    return `執行${action}操作`;
  }

  async executeAction(
    contract: Contract,
    payment: PaymentRecord,
    action: PaymentAction,
    user: AppUser
  ): Promise<void> {
    const transitions = PAYMENT_STATUS_TRANSITIONS[payment.status];
    if (!transitions || !transitions[action]) {
      throw new Error('無效的狀態轉移');
    }

    const newStatus = transitions[action]!;
    const now = new Date().toISOString();

    // 建立操作日誌
    const log: PaymentLog = {
      action,
      user: user.displayName || user.email || '未知用戶',
      timestamp: now,
      note: `從 ${payment.status} 轉為 ${newStatus}`
    };

    // 更新請款記錄
    const updatedPayment: PaymentRecord = {
      ...payment,
      status: newStatus,
      logs: [...(payment.logs || []), log]
    };

    // 根據操作類型設定額外欄位
    if (action === '下一步' && payment.status === '待審核') {
      updatedPayment.verifier = user.displayName || user.email || '未知用戶';
      updatedPayment.approvedAt = now;
    } else if (action === '下一步' && payment.status === '待放款') {
      updatedPayment.financeApprover = user.displayName || user.email || '未知用戶';
    } else if (action === '下一步' && payment.status === '放款中') {
      updatedPayment.paymentDate = now;
    }

    // 更新合約中的請款記錄
    const updatedPayments = contract.payments.map(p => 
      p.round === payment.round ? updatedPayment : p
    );

    // 儲存到 Firestore
    if (contract.id) {
      const contractDoc = doc(this.firestore, 'contracts', contract.id);
      await updateDoc(contractDoc, { payments: updatedPayments });
    }
  }
}