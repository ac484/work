// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：產生合約流水號（C001...）
// 用途：合約建立時呼叫，確保唯一性

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export const generateContractCode = onCall<{}>(async (_, context) => {
  try {
    const db = getFirestore();
    const contractsRef = db.collection('contracts');
    const snapshot = await contractsRef.orderBy('code', 'desc').limit(1).get();

    let nextNumber = 1;
    if (!snapshot.empty) {
      const lastCode = snapshot.docs[0].data().code;
      const lastNumber = parseInt(lastCode.substring(1));
      nextNumber = lastNumber + 1;
    }
    return { code: `C${String(nextNumber).padStart(3, '0')}` };
  } catch (error) {
    return { code: '', error: (error as Error).message };
  }
}); 