// 本檔案為認證攔截器（Authentication Interceptor）
// 功能：自動為 HTTP 請求添加認證標頭（Authorization Bearer Token）
// 用途：確保所有 API 請求都包含有效的 Firebase ID Token
//
// 主要職責：
// - 攔截所有 HTTP 請求
// - 自動添加 Authorization 標頭
// - 處理 Token 過期情況
// - 重新整理過期的 Token
// - 記錄認證相關的請求事件
//
// 工作流程：
// 1. 攔截發出的 HTTP 請求
// 2. 檢查是否需要認證（排除公開 API）
// 3. 獲取當前用戶的 ID Token
// 4. 將 Token 添加到請求標頭
// 5. 處理 Token 過期錯誤
// 6. 記錄認證成功/失敗事件
//
// 依賴服務：
// - AuthService: 提供 Token 管理
// - PermissionMonitorService: 記錄認證事件
// - Router: 處理認證失敗重定向
//
// 配置選項：
// - 公開 API 路徑白名單
// - Token 重新整理策略
// - 認證失敗處理策略
// - 請求重試機制
//
// 未來擴展：
// - 支援多種 Token 類型
// - 支援 Token 輪換
// - 支援請求級別的認證控制
// - 支援認證策略配置
