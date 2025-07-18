# Firebase Functions 指南 (Firebase Functions Guide)

> **Firebase Functions 是本專案的無服務器後端核心**，提供 API 服務、數據處理、業務邏輯執行與系統整合功能。
> 
> 設計原則：**無狀態、事件驅動、自動擴展、成本效益**。

---

## 🎯 主要用途 (Primary Use Cases)

### API 服務 (API Services)
```typescript
// RESTful API 端點
export const api = onRequest(async (req, res) => {
  const { method, url } = req;
  
  switch (method) {
    case 'GET':
      return handleGetRequest(req, res);
    case 'POST':
      return handlePostRequest(req, res);
    case 'PUT':
      return handlePutRequest(req, res);
    case 'DELETE':
      return handleDeleteRequest(req, res);
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
});

// 用戶管理 API
export const userApi = onCall(async (request) => {
  const { action, data } = request.data;
  
  switch (action) {
    case 'create':
      return createUser(data);
    case 'update':
      return updateUser(data);
    case 'delete':
      return deleteUser(data.id);
    default:
      throw new HttpsError('invalid-argument', 'Invalid action');
  }
});
```

### 數據同步與處理 (Data Sync & Processing)
```typescript
// Firestore 觸發器 - 用戶創建時
export const onUserCreate = onDocumentCreated(
  'users/{userId}',
  async (event) => {
    const userData = event.data?.data();
    
    // 發送歡迎郵件
    await sendWelcomeEmail(userData);
    
    // 創建用戶配置文件
    await createUserProfile(userData);
    
    // 記錄用戶註冊事件
    await logUserRegistration(userData);
  }
);

// 數據聚合處理
export const aggregateUserStats = onSchedule(
  'every 24 hours',
  async () => {
    const stats = await calculateUserStatistics();
    await updateDashboardMetrics(stats);
  }
);
```

### 通知服務 (Notification Services)
```typescript
// 推送通知
export const sendNotification = onCall(async (request) => {
  const { userId, title, body, data } = request.data;
  
  const userTokens = await getUserFCMTokens(userId);
  
  const message = {
    notification: { title, body },
    data,
    tokens: userTokens
  };
  
  return await admin.messaging().sendMulticast(message);
});

// 郵件通知
export const sendEmail = onCall(async (request) => {
  const { to, subject, template, data } = request.data;
  
  const emailContent = await renderEmailTemplate(template, data);
  
  return await sendEmailViaProvider({
    to,
    subject,
    html: emailContent
  });
});
```

---

## 🔧 常用觸發器 (Common Triggers)

### HTTP 觸發器 (HTTP Triggers)
```typescript
// onRequest - HTTP 請求觸發
export const httpApi = onRequest(
  { cors: true, region: 'asia-east1' },
  async (req, res) => {
    // 處理 HTTP 請求
    res.json({ message: 'Hello from Firebase Functions!' });
  }
);

// onCall - 可調用函數
export const callableFunction = onCall(
  { region: 'asia-east1' },
  async (request) => {
    // 自動處理認證和 CORS
    const { auth, data } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    return { result: 'Success', userId: auth.uid };
  }
);
```

### Firestore 觸發器 (Firestore Triggers)
```typescript
// 文檔創建觸發器
export const onDocCreate = onDocumentCreated(
  'collection/{docId}',
  async (event) => {
    const newData = event.data?.data();
    console.log('Document created:', newData);
  }
);

// 文檔更新觸發器
export const onDocUpdate = onDocumentUpdated(
  'users/{userId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    // 檢查特定欄位變更
    if (beforeData?.status !== afterData?.status) {
      await handleStatusChange(afterData);
    }
  }
);

// 文檔刪除觸發器
export const onDocDelete = onDocumentDeleted(
  'users/{userId}',
  async (event) => {
    const deletedData = event.data?.data();
    
    // 清理相關數據
    await cleanupUserData(deletedData?.id);
  }
);
```

### 認證觸發器 (Auth Triggers)
```typescript
// 用戶創建觸發器
export const onUserSignUp = onUserCreated(async (user) => {
  const { uid, email, displayName } = user;
  
  // 創建用戶文檔
  await admin.firestore().collection('users').doc(uid).set({
    email,
    displayName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    role: 'user'
  });
  
  // 發送歡迎郵件
  await sendWelcomeEmail(email, displayName);
});

// 用戶刪除觸發器
export const onUserDelete = onUserDeleted(async (user) => {
  const { uid } = user;
  
  // 清理用戶數據
  await admin.firestore().collection('users').doc(uid).delete();
  
  // 清理相關集合
  await cleanupUserCollections(uid);
});
```

### 排程觸發器 (Scheduled Triggers)
```typescript
// 定時任務
export const dailyCleanup = onSchedule(
  'every day 02:00',
  async () => {
    // 清理過期數據
    await cleanupExpiredData();
    
    // 生成日報
    await generateDailyReport();
    
    // 備份重要數據
    await backupCriticalData();
  }
);

// 每小時執行
export const hourlyStats = onSchedule(
  'every 1 hours',
  async () => {
    await updateHourlyStatistics();
  }
);
```

---

## 🚀 部署與測試 (Deployment & Testing)

### 本地開發環境
```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案
firebase init functions

# 啟動模擬器
firebase emulators:start --only functions,firestore,auth

# 查看模擬器 UI
open http://localhost:4000
```

### 開發指令
```bash
# 進入 functions 目錄
cd functions

# 安裝依賴
npm install

# 本地建構
npm run build

# 監聽模式建構
npm run build:watch

# 執行測試
npm run test

# 代碼檢查
npm run lint
```

### 部署指令
```bash
# 部署所有 Functions
firebase deploy --only functions

# 部署特定 Function
firebase deploy --only functions:functionName

# 部署到特定專案
firebase use project-id
firebase deploy --only functions

# 查看部署日誌
firebase functions:log
```

### 測試策略
```typescript
// 單元測試範例
import { describe, it, expect } from '@jest/globals';
import { WrappedFunction } from 'firebase-functions-test/lib/v1';
import * as myFunctions from '../src/index';

describe('User Functions', () => {
  let wrapped: WrappedFunction;
  
  beforeAll(() => {
    wrapped = test.wrap(myFunctions.onUserCreate);
  });
  
  it('should create user profile on user creation', async () => {
    const userData = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    await wrapped(userData);
    
    // 驗證用戶配置文件已創建
    const userDoc = await admin.firestore()
      .collection('users')
      .doc('test-uid')
      .get();
    
    expect(userDoc.exists).toBe(true);
    expect(userDoc.data()?.email).toBe('test@example.com');
  });
});
```

---

## ✅ 最佳實踐 (Best Practices)

### 效能優化
```typescript
// ✅ 使用連接池
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1 // Cloud Functions 建議使用單一連接
});

// ✅ 快取昂貴的操作
const cache = new Map();

export const expensiveOperation = onCall(async (request) => {
  const { key } = request.data;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await performExpensiveCalculation(key);
  cache.set(key, result);
  
  return result;
});

// ✅ 批量處理
export const batchProcess = onCall(async (request) => {
  const { items } = request.data;
  
  // 批量處理而非逐一處理
  const batch = admin.firestore().batch();
  
  items.forEach((item: any) => {
    const docRef = admin.firestore().collection('items').doc();
    batch.set(docRef, item);
  });
  
  await batch.commit();
});
```

### 錯誤處理
```typescript
// ✅ 適當的錯誤處理
export const safeFunction = onCall(async (request) => {
  try {
    const { data } = request;
    
    // 輸入驗證
    if (!data || !data.required_field) {
      throw new HttpsError(
        'invalid-argument',
        'Missing required field'
      );
    }
    
    const result = await processData(data);
    return { success: true, result };
    
  } catch (error) {
    console.error('Function error:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError(
      'internal',
      'An internal error occurred'
    );
  }
});

// ✅ 重試機制
export const retryableFunction = onCall(async (request) => {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await unstableOperation(request.data);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
});
```

### 安全性
```typescript
// ✅ 認證檢查
export const secureFunction = onCall(async (request) => {
  // 檢查用戶認證
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // 檢查用戶權限
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(request.auth.uid)
    .get();
  
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Insufficient permissions');
  }
  
  // 執行受保護的操作
  return await performAdminOperation(request.data);
});

// ✅ 輸入驗證
import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(120)
});

export const validateInput = onCall(async (request) => {
  const { error, value } = userSchema.validate(request.data);
  
  if (error) {
    throw new HttpsError('invalid-argument', error.details[0].message);
  }
  
  return await createUser(value);
});
```

---

## 🚫 反模式與避免事項 (Anti-Patterns & Pitfalls)

### 避免的寫法
```typescript
// ❌ 長時間運行的函數
export const longRunningFunction = onCall(async () => {
  // 避免超過 9 分鐘的操作
  for (let i = 0; i < 1000000; i++) {
    await heavyOperation(i);
  }
});

// ❌ 全域變數濫用
let globalState = {}; // 避免使用全域狀態

export const badStateManagement = onCall(async (request) => {
  globalState = request.data; // 函數實例間可能共享狀態
  return globalState;
});

// ❌ 未處理的 Promise
export const unhandledPromise = onCall(async () => {
  someAsyncOperation(); // 缺少 await 或 .catch()
  return 'done';
});

// ❌ 過度的數據庫查詢
export const inefficientQueries = onCall(async () => {
  const users = await admin.firestore().collection('users').get();
  
  // 避免在循環中進行查詢
  for (const user of users.docs) {
    await admin.firestore()
      .collection('profiles')
      .doc(user.id)
      .get(); // N+1 查詢問題
  }
});
```

### 推薦的替代方案
```typescript
// ✅ 使用批量操作
export const efficientBatchOperation = onCall(async (request) => {
  const { items } = request.data;
  
  // 分批處理大量數據
  const batchSize = 500;
  const batches = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    batches.push(processBatch(batch));
  }
  
  return await Promise.all(batches);
});

// ✅ 適當的狀態管理
export const properStateManagement = onCall(async (request) => {
  // 使用函數參數而非全域變數
  const localState = initializeState(request.data);
  return processWithState(localState);
});

// ✅ 錯誤處理和 Promise 管理
export const properAsyncHandling = onCall(async (request) => {
  try {
    const results = await Promise.all([
      operation1(request.data),
      operation2(request.data),
      operation3(request.data)
    ]);
    
    return { success: true, results };
  } catch (error) {
    console.error('Batch operation failed:', error);
    throw new HttpsError('internal', 'Batch operation failed');
  }
});
```

---

## 📊 監控與日誌 (Monitoring & Logging)

### 日誌記錄
```typescript
import { logger } from 'firebase-functions/v2';

export const monitoredFunction = onCall(async (request) => {
  const startTime = Date.now();
  
  logger.info('Function started', {
    userId: request.auth?.uid,
    data: request.data
  });
  
  try {
    const result = await processRequest(request.data);
    
    logger.info('Function completed successfully', {
      duration: Date.now() - startTime,
      resultSize: JSON.stringify(result).length
    });
    
    return result;
  } catch (error) {
    logger.error('Function failed', {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    });
    
    throw error;
  }
});
```

### 效能監控
```typescript
// 自定義指標
export const performanceTracking = onCall(async (request) => {
  const metrics = {
    startTime: Date.now(),
    memoryUsage: process.memoryUsage(),
    requestSize: JSON.stringify(request.data).length
  };
  
  const result = await processRequest(request.data);
  
  metrics.endTime = Date.now();
  metrics.duration = metrics.endTime - metrics.startTime;
  metrics.responseSize = JSON.stringify(result).length;
  
  // 記錄效能指標
  logger.info('Performance metrics', metrics);
  
  return result;
});
```

---

## 📋 開發檢查清單 (Development Checklist)

### ✅ 開發前檢查
- [ ] 確認 Firebase 專案配置
- [ ] 設定適當的運行時和記憶體限制
- [ ] 配置環境變數
- [ ] 設定適當的區域 (asia-east1)

### ✅ 代碼品質檢查
- [ ] 輸入驗證和錯誤處理
- [ ] 適當的認證和授權檢查
- [ ] 效能優化 (批量操作、快取)
- [ ] 日誌記錄和監控

### ✅ 測試檢查
- [ ] 單元測試覆蓋率 > 80%
- [ ] 整合測試通過
- [ ] 模擬器測試正常
- [ ] 效能測試滿足要求

### ✅ 部署前檢查
- [ ] 建構無錯誤
- [ ] 環境變數正確設定
- [ ] 權限配置適當
- [ ] 監控和警報設定

---

> **核心理念**: Firebase Functions 提供可擴展、成本效益的後端服務，通過事件驅動架構實現高效的業務邏輯處理。
> 
> **最佳實踐**: 遵循無狀態設計、適當的錯誤處理、效能優化和安全性原則，確保函數的可靠性和可維護性。
