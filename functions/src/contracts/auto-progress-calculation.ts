// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：自動進度計算與狀態更新
// 用途：合約進度追蹤與狀態管理

import { getFirestore } from 'firebase-admin/firestore';
import { withErrorHandling } from './error-handler';
import { checkAuth, getContract, calculatePaymentProgress } from './utils';



const determineContractStatus = (completionRate: number) => {
  if (completionRate >= 100) return '已完成';
  if (completionRate === 0) return '未開始';
  return '進行中';
};

export const calculateContractProgress = withErrorHandling(async (request) => {
  const { contractId } = request.data;
  checkAuth(request);
  
  const { ref: contractRef, data: contractData } = await getContract(contractId);
  const contractAmount = contractData?.contractAmount || 0;
  const payments = contractData?.payments || [];

  const progress = calculatePaymentProgress(payments, contractAmount);
  const status = determineContractStatus(progress.completionRate);

  const progressData = {
    ...progress,
    status,
    lastCalculated: new Date(),
  };

  await contractRef.update(progressData);
  return { progress: progressData };
});

// 批量重新計算所有合約進度
export const calculateAllContractsProgress = withErrorHandling(async (request) => {
  checkAuth(request);
  
  const db = getFirestore();
  const snapshot = await db.collection('contracts').get();

  const results = [];
  for (const doc of snapshot.docs) {
    try {
      const contractData = doc.data();
      const payments = contractData?.payments || [];
      const contractAmount = contractData?.contractAmount || 0;
      
      const progress = calculatePaymentProgress(payments, contractAmount);
      const status = determineContractStatus(progress.completionRate);

      await doc.ref.update({
        completionRate: progress.completionRate,
        completedAmount: progress.completedAmount,
        status,
        lastCalculated: new Date(),
      });

      results.push({ contractId: doc.id, success: true });
    } catch (error) {
      results.push({ contractId: doc.id, success: false, error: (error as Error).message });
    }
  }

  return { results };
}); 