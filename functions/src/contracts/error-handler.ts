// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：統一錯誤處理包裝器
// 用途：簡化 Functions 錯誤處理邏輯

import { onCall } from 'firebase-functions/v2/https';
import { createErrorResponse, createSuccessResponse } from './utils';

// 統一錯誤處理包裝器
export const withErrorHandling = <T>(
  handler: (request: any) => Promise<T>
) => {
  return onCall<T>(async (request) => {
    try {
      const result = await handler(request);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse((error as Error).message);
    }
  });
}; 