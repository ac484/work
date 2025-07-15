// 本檔案為權限快取服務（Permission Cache Service）
// 功能：快取用戶權限資料，提升權限檢查效能
// 用途：減少重複的 Firestore 查詢，優化權限檢查響應時間
//
// 主要職責：
// - 快取用戶權限資料
// - 管理快取生命週期
// - 提供權限查詢介面
// - 處理快取失效策略
// - 支援快取統計分析
//
// 快取策略：
// - 用戶權限快取（TTL: 5分鐘）
// - 角色權限快取（TTL: 30分鐘）
// - 權限矩陣快取（TTL: 1小時）
// - 動態權限快取（TTL: 1分鐘）
//
// 核心方法：
// - setUserPermissions(): 設定用戶權限快取
// - getUserPermissions(): 獲取用戶權限
// - setRolePermissions(): 設定角色權限快取
// - getRolePermissions(): 獲取角色權限
// - invalidateUserCache(): 清除用戶快取
// - invalidateRoleCache(): 清除角色快取
// - getCacheStats(): 獲取快取統計
//
// 快取鍵設計：
// - 用戶權限: `user:${userId}:permissions`
// - 角色權限: `role:${roleId}:permissions`
// - 權限矩陣: `matrix:${resourceType}:${operation}`
// - 用戶角色: `user:${userId}:roles`
//
// 失效策略：
// - 時間失效（TTL）
// - 手動失效（權限變更）
// - 記憶體壓力失效（LRU）
// - 版本失效（權限版本變更）
//
// 依賴服務：
// - PermissionService: 提供權限資料
// - RoleService: 提供角色資料
// - UserService: 提供用戶資料
//
// 未來擴展：
// - 支援分散式快取（Redis）
// - 支援快取預熱
// - 支援快取分層
// - 支援快取監控
// - 支援快取優化建議
