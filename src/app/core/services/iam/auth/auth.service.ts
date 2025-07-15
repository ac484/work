// 本檔案為認證服務（Authentication Service）
// 功能：管理用戶認證狀態、登入/登出、Token 管理
// 用途：提供統一的認證介面，整合 Firebase Authentication
//
// 主要職責：
// - 用戶登入/登出管理
// - Firebase ID Token 管理
// - 認證狀態監控
// - 用戶資料同步
// - 認證事件處理
//
// 核心方法：
// - loginWithGoogle(): Google 登入
// - loginWithEmail(): 電子郵件登入
// - registerWithEmail(): 電子郵件註冊
// - logout(): 登出
// - getCurrentUser(): 獲取當前用戶
// - getIdToken(): 獲取 ID Token
// - refreshToken(): 重新整理 Token
//
// 認證流程：
// 1. 用戶選擇登入方式
// 2. 調用 Firebase Auth 方法
// 3. 驗證認證結果
// 4. 同步用戶資料到 Firestore
// 5. 更新應用狀態
// 6. 觸發認證事件
//
// 依賴服務：
// - Firebase Auth: 核心認證功能
// - Firestore: 用戶資料儲存
// - UserService: 用戶資料管理
// - PermissionService: 權限初始化
//
// 安全考量：
// - Token 安全儲存
// - 自動 Token 重新整理
// - 認證狀態驗證
// - 登出時清理資料
//
// 未來擴展：
// - 支援多種認證提供者
// - 支援雙因素認證
// - 支援社交登入
// - 支援企業 SSO
// - 支援生物識別認證
