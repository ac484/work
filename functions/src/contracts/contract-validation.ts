// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：合約驗證邏輯
// 用途：合約資料完整性與格式驗證

import { getFirestore } from 'firebase-admin/firestore';
import { withErrorHandling } from './error-handler';

interface ContractValidationInput {
  contractData: {
    code?: string;
    client?: string;
    projectName?: string;
    contractAmount?: number;
    orderNo?: string;
    projectNo?: string;
  };
  validationType: 'create' | 'update' | 'code' | 'amount';
}

const validateContractCode = (code: string) => {
  const codePattern = /^C\d{3,}$/;
  if (!codePattern.test(code)) {
    throw new Error('合約編號格式錯誤，應為 C 開頭後接數字（如：C001）');
  }
};

const validateRequiredFields = (data: ContractValidationInput['contractData']) => {
  if (!data.client?.trim()) throw new Error('客戶名稱為必填欄位');
  if (!data.projectName?.trim()) throw new Error('專案名稱為必填欄位');
  if (!data.contractAmount || data.contractAmount <= 0) throw new Error('合約金額必須大於 0');
};

const validateAmount = (amount: number) => {
  if (amount < 0) throw new Error('合約金額不能為負數');
  if (amount > 999999999) throw new Error('合約金額超過上限');
};

const checkCodeUniqueness = async (code: string) => {
  const db = getFirestore();
  const snapshot = await db.collection('contracts').where('code', '==', code).get();
  if (!snapshot.empty) throw new Error('合約編號已存在');
};

const getProjectNoWarning = (projectNo: string) => {
  if (!/^[A-Z]{2,3}-\d{4,6}$/.test(projectNo)) {
    return '建議專案編號格式：AA-2024001 或 AAA-2024001';
  }
  return undefined;
};

export const validateContract = withErrorHandling(async (request) => {
  const { contractData, validationType } = request.data;
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    if (contractData.code) validateContractCode(contractData.code);
    if (validationType === 'create') validateRequiredFields(contractData);
    if (contractData.contractAmount !== undefined) validateAmount(contractData.contractAmount);
    if (contractData.code && validationType === 'create') await checkCodeUniqueness(contractData.code);
    
    const warning = contractData.projectNo ? getProjectNoWarning(contractData.projectNo) : undefined;
    if (warning) warnings.push(warning);
    
  } catch (error) {
    errors.push((error as Error).message);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}); 