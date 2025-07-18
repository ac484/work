// 本服務為請款操作流程服務
// 功能：狀態轉移、操作執行、提示文字生成
// 用途：請款流程的業務邏輯處理
import { Injectable, inject } from '@angular/core';
import { PaymentRecord, PaymentAction, PaymentStatus, PAYMENT_STATUS_TRANSITIONS, Contract } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';
import { FirebaseFunctionsService } from '../firebase-functions.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentActionService {
  private firebaseFunctions = inject(FirebaseFunctionsService);

  getAvailableActions(payment: PaymentRecord): PaymentAction[] {
    const transitions = PAYMENT_STATUS_TRANSITIONS[payment.status];
    return transitions ? Object.keys(transitions) as PaymentAction[] : [];
  }

  getActionDescription(action: PaymentAction): string {
    const descriptions: Record<PaymentAction, string> = {
      '送出': '送出請款申請進行審核',
      '撤回': '撤回請款申請回到草稿',
      '下一步': '進入下一個流程階段',
      '拒絕': '拒絕請款申請',
      '重新申請': '重新申請被拒絕的請款'
    };
    return descriptions[action] || action;
  }

  getActionButtonClass(action: PaymentAction): string {
    const classes: Record<PaymentAction, string> = {
      '送出': 'bg-blue-500 hover:bg-blue-600',
      '撤回': 'bg-gray-500 hover:bg-gray-600',
      '下一步': 'bg-green-500 hover:bg-green-600',
      '拒絕': 'bg-red-500 hover:bg-red-600',
      '重新申請': 'bg-orange-500 hover:bg-orange-600'
    };
    return classes[action] || 'bg-gray-500 hover:bg-gray-600';
  }

  async executeAction(
    contract: Contract,
    payment: PaymentRecord,
    action: PaymentAction,
    user: AppUser
  ): Promise<void> {
    if (!contract.id) {
      throw new Error('合約 ID 不存在');
    }

    // 使用 Firebase Function 執行請款操作
    await this.firebaseFunctions.executePaymentAction(
      contract.id,
      payment.round,
      action,
      user
    );
  }
}