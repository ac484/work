// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：請款申請建立與驗證
// 用途：用戶發起請款申請的業務邏輯處理

import { withErrorHandling } from './error-handler';
import { checkAuth, getContract } from './utils';



const validatePaymentRequest = (amount: number, percent: number, contractAmount: number, totalRequested: number) => {
  if (amount <= 0) throw new Error('請款金額必須大於 0');
  if (amount > contractAmount) throw new Error('請款金額不能超過合約總額');
  
  const calculatedPercent = Math.round((amount / contractAmount) * 100);
  if (Math.abs(calculatedPercent - percent) > 1) {
    throw new Error('請款百分比與金額不符');
  }
  
  if (totalRequested + amount > contractAmount) {
    throw new Error('請款總額將超過合約金額');
  }
};

export const createPaymentRequest = withErrorHandling(async (request) => {
  const { contractId, amount, percent, note, userDisplayName } = request.data;
  checkAuth(request);
  
  const { ref: contractRef, data: contractData } = await getContract(contractId);
  const contractAmount = contractData?.contractAmount || 0;
  const existingPayments = contractData?.payments || [];
  const totalRequested = existingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  validatePaymentRequest(amount, percent, contractAmount, totalRequested);
  
  const nextRound = existingPayments.length + 1;
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

  const updatedPayments = [...existingPayments, paymentRecord];
  await contractRef.update({
    payments: updatedPayments,
    lastModified: new Date(),
  });

  return { paymentRecord };
}); 