// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：自動進度計算與狀態更新
// 用途：合約進度追蹤與狀態管理

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

interface ProgressCalculationInput {
  contractId: string;
}

export const calculateContractProgress = onCall<ProgressCalculationInput>(async (request) => {
  try {
    const { contractId } = request.data;
    
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
    const payments = contractData?.payments || [];

    // 計算請款統計
    const completedPayments = payments.filter((p: any) => p.status === '完成');
    const completedAmount = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalRequested = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const pendingAmount = totalRequested - completedAmount;

    // 計算完成百分比
    const completionRate = contractAmount > 0 ? Math.round((completedAmount / contractAmount) * 100) : 0;

    // 判斷合約狀態
    let status = '進行中';
    if (completionRate >= 100) {
      status = '已完成';
    } else if (completionRate === 0) {
      status = '未開始';
    }

    // 更新合約進度
    const progressData = {
      completionRate,
      completedAmount,
      pendingAmount,
      totalRequested,
      paymentCount: payments.length,
      completedPaymentCount: completedPayments.length,
      status,
      lastCalculated: new Date(),
    };

    await contractRef.update(progressData);

    return { 
      success: true, 
      progress: progressData 
    };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 批量重新計算所有合約進度
export const calculateAllContractsProgress = onCall(async (request) => {
  try {
    if (!request.auth) {
      return { success: false, error: '未授權' };
    }

    const db = getFirestore();
    const contractsRef = db.collection('contracts');
    const snapshot = await contractsRef.get();

    const results = [];
    for (const doc of snapshot.docs) {
      try {
        const contractData = doc.data();
        const payments = contractData?.payments || [];
        
        const completedPayments = payments.filter((p: any) => p.status === '完成');
        const completedAmount = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const contractAmount = contractData?.contractAmount || 0;
        const completionRate = contractAmount > 0 ? Math.round((completedAmount / contractAmount) * 100) : 0;

        let status = '進行中';
        if (completionRate >= 100) {
          status = '已完成';
        } else if (completionRate === 0) {
          status = '未開始';
        }

        await doc.ref.update({
          completionRate,
          completedAmount,
          status,
          lastCalculated: new Date(),
        });

        results.push({ contractId: doc.id, success: true });
      } catch (error) {
        results.push({ contractId: doc.id, success: false, error: (error as Error).message });
      }
    }

    return { success: true, results };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}); 