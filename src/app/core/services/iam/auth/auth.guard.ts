// 本檔案為認證守衛（Authentication Guard）
// 功能：保護需要登入的路由，檢查用戶是否已通過 Firebase Authentication
// 用途：路由級別的認證保護，確保只有已登入用戶才能訪問受保護的頁面
// 
// 主要職責：
// - 檢查用戶登入狀態
// - 未登入時重定向到登入頁面
// - 已登入時允許訪問
// - 記錄認證檢查事件
//
// 使用方式：
// - 在路由配置中添加 canActivate: [AuthGuard]
// - 可與 PermissionGuard 組合使用，先檢查認證再檢查權限
//
// 依賴服務：
// - AuthService: 提供認證狀態檢查
// - Router: 提供路由重定向功能
// - PermissionMonitorService: 記錄認證檢查事件
//
// 未來擴展：
// - 支援多種認證方式（Google、Email、SMS等）
// - 支援記住登入狀態
// - 支援自動重新認證
// - 支援登入頁面自訂
