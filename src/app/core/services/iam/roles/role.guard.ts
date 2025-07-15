// 本檔案為角色守衛（Role Guard）
// 功能：基於用戶角色保護路由和功能
// 用途：提供角色級別的訪問控制，確保只有特定角色用戶才能訪問
//
// 主要職責：
// - 檢查用戶角色
// - 驗證角色權限
// - 處理角色衝突
// - 記錄角色檢查事件
// - 提供角色級別重定向
//
// 角色檢查策略：
// - 單一角色檢查：檢查用戶是否具有特定角色
// - 多重角色檢查：檢查用戶是否具有任一指定角色
// - 全部角色檢查：檢查用戶是否具有所有指定角色
// - 角色層級檢查：檢查用戶是否具有指定層級的角色
// - 角色組合檢查：檢查用戶是否具有特定的角色組合
//
// 核心方法：
// - canActivate(): 路由激活檢查
// - canDeactivate(): 路由離開檢查
// - canLoad(): 模組載入檢查
// - checkRole(): 角色檢查邏輯
// - handleRoleConflict(): 角色衝突處理
// - logRoleCheck(): 記錄角色檢查
//
// 配置選項：
// - requiredRoles: 需要的角色列表
// - roleMode: 角色檢查模式（any/all/hierarchy）
// - fallbackRoute: 角色不符時的重定向路由
// - allowInheritedRoles: 是否允許繼承角色
// - roleConflictStrategy: 角色衝突處理策略
//
// 使用方式：
// - 路由級別：在路由配置中添加 canActivate: [RoleGuard]
// - 元件級別：在元件中使用 RoleGuard 服務
// - 功能級別：在功能中使用角色檢查方法
//
// 依賴服務：
// - RoleService: 提供角色資料
// - RoleAssignmentService: 提供角色指派
// - PermissionMonitorService: 記錄角色檢查
// - Router: 提供路由重定向
//
// 未來擴展：
// - 支援動態角色檢查
// - 支援角色條件檢查
// - 支援角色時間限制
// - 支援角色地理位置限制
// - 支援角色設備限制
