// 本服務為請款申請建立服務
// 功能：權限檢查、請款草稿建立、輪次計算
// 用途：用戶發起請款申請的業務邏輯處理
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Contract, PaymentRecord, PaymentLog } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';
import { PermissionService } from '../../../../core/services/iam/permissions/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Injectable({
  providedIn: 'root'
})
export class PaymentRequestService {
  private firestore = inject(Firestore);
  private permissionService = inject(PermissionService);

  async canCreate(user: AppUser | null): Promise<boolean> {
    if (!user) return false;
    
    const permissions = await this.permissionService.getUserPermissions(user);
    return permissions.includes(PERMISSIONS.CREATE_PAYMENT_REQUEST);
  }

  async createDraft(
    contract: Contract,
    user: AppUser,
    amount: number,
    percent: number,
    note: string
  ): Promise<PaymentRecord> {
    const hasPermission = await this.canCreate(user);
    if (!hasPermission) {
      throw new Error('permission_denied');
    }

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