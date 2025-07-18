// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：請款狀態自動流轉與權限驗證
// 用途：請款流程的狀態管理與業務邏輯處理

import { withErrorHandling } from './error-handler';
import { checkAuth, getContract } from './utils';



// 請款狀態轉移表
const PAYMENT_STATUS_TRANSITIONS = {
  草稿: { 送出: '待審核' },
  待審核: { 撤回: '草稿', 下一步: '待放款', 拒絕: '拒絕' },
  待放款: { 撤回: '草稿', 下一步: '放款中', 拒絕: '拒絕' },
  放款中: { 下一步: '完成', 拒絕: '拒絕' },
  完成: {},
  拒絕: { 重新申請: '草稿' },
} as const;

export const executePaymentAction = withErrorHandling(async (request) => {
  const { contractId, paymentRound, action, userDisplayName } = request.data;
  checkAuth(request);
  
  const { ref: contractRef, data: contractData } = await getContract(contractId);
  const payments = contractData?.payments || [];
  const payment = payments.find((p: any) => p.round === paymentRound);

  if (!payment) throw new Error('請款記錄不存在');

  const currentStatus = payment.status;
  const allowedTransitions = PAYMENT_STATUS_TRANSITIONS[currentStatus as keyof typeof PAYMENT_STATUS_TRANSITIONS];

  if (!allowedTransitions || !allowedTransitions[action as keyof typeof allowedTransitions]) {
    throw new Error(`當前狀態 ${currentStatus} 不允許執行 ${action} 操作`);
  }

  const newStatus = allowedTransitions[action as keyof typeof allowedTransitions];
  const actionLog = {
    action,
    user: userDisplayName,
    timestamp: new Date(),
    fromStatus: currentStatus,
    toStatus: newStatus,
  };

  const updatedPayment = {
    ...payment,
    status: newStatus,
    updatedAt: new Date(),
    logs: [...(payment.logs || []), actionLog],
  };

  const updatedPayments = payments.map((p: any) => 
    p.round === paymentRound ? updatedPayment : p
  );

  await contractRef.update({
    payments: updatedPayments,
    lastModified: new Date(),
  });

  return { newStatus, actionLog };
}); 