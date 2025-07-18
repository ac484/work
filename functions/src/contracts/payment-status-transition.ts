// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：請款狀態自動流轉與權限驗證
// 用途：請款流程的狀態管理與業務邏輯處理

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

interface PaymentStatusTransitionInput {
  contractId: string;
  paymentRound: number;
  action: '送出' | '撤回' | '下一步' | '拒絕' | '重新申請';
  userId: string;
  userDisplayName: string;
}

// 請款狀態轉移表
const PAYMENT_STATUS_TRANSITIONS = {
  草稿: {
    送出: '待審核',
  },
  待審核: {
    撤回: '草稿',
    下一步: '待放款',
    拒絕: '拒絕',
  },
  待放款: {
    撤回: '草稿',
    下一步: '放款中',
    拒絕: '拒絕',
  },
  放款中: {
    下一步: '完成',
    拒絕: '拒絕',
  },
  完成: {},
  拒絕: {
    重新申請: '草稿',
  },
};

export const executePaymentAction = onCall<PaymentStatusTransitionInput>(async (request) => {
  try {
    const { contractId, paymentRound, action, userDisplayName } = request.data;
    
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
    const payments = contractData?.payments || [];
    const payment = payments.find((p: any) => p.round === paymentRound);

    if (!payment) {
      return { success: false, error: '請款記錄不存在' };
    }

    const currentStatus = payment.status;
    const allowedTransitions = PAYMENT_STATUS_TRANSITIONS[currentStatus as keyof typeof PAYMENT_STATUS_TRANSITIONS];

    if (!allowedTransitions || !allowedTransitions[action as keyof typeof allowedTransitions]) {
      return { success: false, error: `當前狀態 ${currentStatus} 不允許執行 ${action} 操作` };
    }

    const newStatus = allowedTransitions[action as keyof typeof allowedTransitions];

    // 建立操作日誌
    const actionLog = {
      action,
      user: userDisplayName,
      timestamp: new Date(),
      fromStatus: currentStatus,
      toStatus: newStatus,
    };

    // 更新請款記錄
    const updatedPayment = {
      ...payment,
      status: newStatus,
      updatedAt: new Date(),
      logs: [...(payment.logs || []), actionLog],
    };

    // 更新合約中的請款記錄
    const updatedPayments = payments.map((p: any) => 
      p.round === paymentRound ? updatedPayment : p
    );

    await contractRef.update({
      payments: updatedPayments,
      lastModified: new Date(),
    });

    return { 
      success: true, 
      newStatus,
      actionLog 
    };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}); 