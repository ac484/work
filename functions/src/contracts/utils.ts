// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：核心工具函數庫
// 用途：統一處理常見操作，減少重複代碼

import { getFirestore } from 'firebase-admin/firestore';
import { CallableRequest } from 'firebase-functions/v2/https';

// 統一錯誤回應格式
export const createErrorResponse = (message: string) => ({
  success: false,
  error: message
});

// 統一成功回應格式
export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  ...data
});

// 權限檢查
export const checkAuth = (request: CallableRequest) => {
  if (!request.auth) {
    throw new Error('未授權');
  }
  return request.auth;
};

// 合約存在性檢查
export const getContract = async (contractId: string) => {
  const db = getFirestore();
  const contractRef = db.collection('contracts').doc(contractId);
  const contractDoc = await contractRef.get();
  
  if (!contractDoc.exists) {
    throw new Error('合約不存在');
  }
  
  return { ref: contractRef, data: contractDoc.data() };
};

// 合約編號生成
export const generateContractCode = async () => {
  const db = getFirestore();
  const snapshot = await db.collection('contracts')
    .orderBy('code', 'desc')
    .limit(1)
    .get();

  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastCode = snapshot.docs[0].data().code;
    const lastNumber = parseInt(lastCode.substring(1));
    nextNumber = lastNumber + 1;
  }
  
  return `C${String(nextNumber).padStart(3, '0')}`;
};

// 請款進度計算
export const calculatePaymentProgress = (payments: any[], contractAmount: number) => {
  const completedPayments = payments.filter(p => p.status === '完成');
  const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRequested = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completionRate = contractAmount > 0 ? Math.round((completedAmount / contractAmount) * 100) : 0;
  
  return {
    completionRate,
    completedAmount,
    pendingAmount: totalRequested - completedAmount,
    totalRequested,
    paymentCount: payments.length,
    completedPaymentCount: completedPayments.length
  };
}; 