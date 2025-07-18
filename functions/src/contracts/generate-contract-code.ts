// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：產生合約流水號（C001...）
// 用途：合約建立時呼叫，確保唯一性

import { withErrorHandling } from './error-handler';
import { generateContractCode as generateCode } from './utils';

export const generateContractCode = withErrorHandling(async () => {
  const code = await generateCode();
  return { code };
}); 