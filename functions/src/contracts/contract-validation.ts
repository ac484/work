// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：合約驗證邏輯
// 用途：合約資料完整性與格式驗證

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

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

export const validateContract = onCall<ContractValidationInput>(async (request) => {
  try {
    const { contractData, validationType } = request.data;
    const errors: string[] = [];
    const warnings: string[] = [];

    // 合約編號驗證
    if (contractData.code) {
      const codePattern = /^C\d{3,}$/;
      if (!codePattern.test(contractData.code)) {
        errors.push('合約編號格式錯誤，應為 C 開頭後接數字（如：C001）');
      }
    }

    // 基本資料完整性檢查
    if (validationType === 'create') {
      if (!contractData.client?.trim()) {
        errors.push('客戶名稱為必填欄位');
      }
      if (!contractData.projectName?.trim()) {
        errors.push('專案名稱為必填欄位');
      }
      if (!contractData.contractAmount || contractData.contractAmount <= 0) {
        errors.push('合約金額必須大於 0');
      }
    }

    // 金額驗證
    if (contractData.contractAmount !== undefined) {
      if (contractData.contractAmount < 0) {
        errors.push('合約金額不能為負數');
      }
      if (contractData.contractAmount > 999999999) {
        errors.push('合約金額超過上限');
      }
    }

    // 編號唯一性檢查
    if (contractData.code && validationType === 'create') {
      const db = getFirestore();
      const snapshot = await db.collection('contracts')
        .where('code', '==', contractData.code)
        .get();
      
      if (!snapshot.empty) {
        errors.push('合約編號已存在');
      }
    }

    // 專案編號格式建議
    if (contractData.projectNo && !/^[A-Z]{2,3}-\d{4,6}$/.test(contractData.projectNo)) {
      warnings.push('建議專案編號格式：AA-2024001 或 AAA-2024001');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      valid: false,
      errors: [(error as Error).message]
    };
  }
}); 