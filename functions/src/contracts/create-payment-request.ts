// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：請款申請建立與驗證
// 用途：用戶發起請款申請的業務邏輯處理

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

interface CreatePaymentRequestInput {
  contractId: string;
  amount: number;
  percent: number;
  note: string;
  userId: string;
  userDisplayName: string;
}

export const createPaymentRequest = onCall<CreatePaymentRequestInput>(async (request) => {
  try {
    const { contractId, amount, percent, note, userDisplayName } = request.data;
    
    if (!request.auth) {
      return { success: false, error: '未授權' };
    }

    const db = getFirestore();
    const contractRef = db.collection('contracts').doc(contractId);
    const contractDoc = await contractRef.get();

    if (!contractDoc.exists) {
      return { success: false, error: '合約不存在' };
    }

    const contractData = contractDoc.data();
    const contractAmount = contractData?.contractAmount || 0;

    // 驗證請款金額
    if (amount <= 0) {
      return { success: false, error: '請款金額必須大於 0' };
    }

    if (amount > contractAmount) {
      return { success: false, error: '請款金額不能超過合約總額' };
    }

    // 驗證百分比
    const calculatedPercent = Math.round((amount / contractAmount) * 100);
    if (Math.abs(calculatedPercent - percent) > 1) {
      return { success: false, error: '請款百分比與金額不符' };
    }

    // 計算請款輪次
    const existingPayments = contractData?.payments || [];
    const nextRound = existingPayments.length + 1;

    // 檢查是否超過合約總額
    const totalRequested = existingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    if (totalRequested + amount > contractAmount) {
      return { success: false, error: '請款總額將超過合約金額' };
    }

    // 建立請款記錄
    const paymentRecord = {
      round: nextRound,
      amount,
      percent,
      note,
      status: '草稿',
      requestedBy: userDisplayName,
      requestedAt: new Date(),
      updatedAt: new Date(),
    };

    // 更新合約
    const updatedPayments = [...existingPayments, paymentRecord];
    await contractRef.update({
      payments: updatedPayments,
      lastModified: new Date(),
    });

    return { 
      success: true, 
      paymentRecord 
    };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}); 