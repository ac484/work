// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：合約變更管理（追加/追減金額）
// 用途：合約金額調整的業務邏輯處理

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

interface ContractChangeInput {
  contractId: string;
  type: '追加' | '追減';
  amount: number;
  note: string;
  userId: string;
  userDisplayName: string;
}

export const addContractChange = onCall<ContractChangeInput>(async (request) => {
  try {
    const { contractId, type, amount, note, userDisplayName } = request.data;
    
    if (!request.auth) {
      return { success: false, error: '未授權' };
    }

    if (amount <= 0) {
      return { success: false, error: '變更金額必須大於 0' };
    }

    const db = getFirestore();
    const contractRef = db.collection('contracts').doc(contractId);
    const contractDoc = await contractRef.get();

    if (!contractDoc.exists) {
      return { success: false, error: '合約不存在' };
    }

    const contractData = contractDoc.data();
    const currentAmount = contractData?.contractAmount || 0;

    // 追減金額不能超過現有金額
    if (type === '追減' && amount > currentAmount) {
      return { success: false, error: '追減金額不能超過合約總額' };
    }

    // 計算新金額
    const newAmount = type === '追加' ? currentAmount + amount : currentAmount - amount;

    // 建立變更記錄
    const changeRecord = {
      type,
      amount,
      note,
      previousAmount: currentAmount,
      newAmount,
      userDisplayName,
      timestamp: new Date(),
    };

    // 更新合約
    await contractRef.update({
      contractAmount: newAmount,
      lastModified: new Date(),
      changes: [...(contractData?.changes || []), changeRecord],
    });

    return { 
      success: true, 
      newAmount,
      changeRecord 
    };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}); 