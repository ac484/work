// 本服務為請款申請建立服務
// 功能：請款草稿建立、輪次計算
// 用途：用戶發起請款申請的業務邏輯處理
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Contract, PaymentRecord, PaymentLog } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentRequestService {
  private firestore = inject(Firestore);

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

    // 計算下一個請款輪次
    const nextRound = (contract.payments?.length || 0) + 1;
    const now = new Date().toISOString();

    // 建立初始日誌
    const initialLog: PaymentLog = {
      action: '重新申請', // 建立草稿視為重新申請
      user: user.displayName || user.email || '未知用戶',
      timestamp: now,
      note: '建立請款草稿'
    };

    // 建立請款記錄
    const paymentRecord: PaymentRecord = {
      round: nextRound,
      status: '草稿',
      percent,
      amount,
      applicant: user.displayName || user.email || '未知用戶',
      date: now,
      note,
      files: [],
      logs: [initialLog]
    };

    // 更新合約的請款記錄
    const updatedPayments = [...(contract.payments || []), paymentRecord];
    const contractDoc = doc(this.firestore, 'contracts', contract.id);
    
    await updateDoc(contractDoc, {
      payments: updatedPayments,
      paymentRound: nextRound
    });

    return paymentRecord;
  }
}