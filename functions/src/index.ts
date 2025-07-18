/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：Firebase Functions 統一入口
// 用途：匯出所有合約管理相關的 Functions

import { initializeApp } from 'firebase-admin/app';

// 初始化 Firebase Admin
initializeApp();

// Export functions
export * from './contracts/generate-contract-code';
export * from './contracts/payment-status-transition';
export * from './contracts/create-payment-request';
export * from './contracts/contract-change-management';
export * from './contracts/contract-validation';
export * from './contracts/auto-progress-calculation';
export * from './contracts/contract-creation';
