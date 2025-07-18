// 本服務為請款申請建立服務
// 功能：請款草稿建立、輪次計算
// 用途：用戶發起請款申請的業務邏輯處理
import { Injectable, inject } from '@angular/core';
import { Contract, PaymentRecord } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';
import { FirebaseFunctionsService } from '../firebase-functions.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentRequestService {
  private firebaseFunctions = inject(FirebaseFunctionsService);

  async createDraft(
    contract: Contract,
    user: AppUser,
    amount: number,
    percent: number,
    note: string
  ): Promise<PaymentRecord> {
    if (!contract.id) {
      throw new Error('合約 ID 不存在');
    }

    // 使用 Firebase Function 建立請款申請
    return await this.firebaseFunctions.createPaymentRequest(
      contract.id,
      amount,
      percent,
      note,
      user
    );
  }
}