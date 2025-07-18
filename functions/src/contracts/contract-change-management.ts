// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：合約變更管理（追加/追減金額）
// 用途：合約金額調整的業務邏輯處理

import { withErrorHandling } from './error-handler';
import { checkAuth, getContract } from './utils';



const validateContractChange = (type: string, amount: number, currentAmount: number) => {
  if (amount <= 0) throw new Error('變更金額必須大於 0');
  if (type === '追減' && amount > currentAmount) {
    throw new Error('追減金額不能超過合約總額');
  }
};

export const addContractChange = withErrorHandling(async (request) => {
  const { contractId, type, amount, note, userDisplayName } = request.data;
  checkAuth(request);
  
  const { ref: contractRef, data: contractData } = await getContract(contractId);
  const currentAmount = contractData?.contractAmount || 0;
  
  validateContractChange(type, amount, currentAmount);
  
  const newAmount = type === '追加' ? currentAmount + amount : currentAmount - amount;
  const changeRecord = {
    type,
    amount,
    note,
    previousAmount: currentAmount,
    newAmount,
    userDisplayName,
    timestamp: new Date(),
  };

  await contractRef.update({
    contractAmount: newAmount,
    lastModified: new Date(),
    changes: [...(contractData?.changes || []), changeRecord],
  });

  return { newAmount, changeRecord };
}); 