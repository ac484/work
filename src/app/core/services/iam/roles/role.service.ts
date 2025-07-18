// 本檔案為角色服務（Role Service）
// 功能：管理角色定義、角色權限、角色層級關係
// 用途：提供完整的角色管理功能，支援角色的 CRUD 操作
//
// 主要職責：
// - 角色 CRUD 操作
// - 角色權限管理
// - 角色層級關係維護
// - 角色模板管理
// - 角色統計分析
//
// 角色類型：
// - 系統角色：系統預設角色（admin、user、guest）
// - 自訂角色：用戶自定義角色
// - 功能角色：基於功能的角色
// - 專案角色：專案特定的角色
// - 臨時角色：有時間限制的角色
//
// 核心方法：
// - createRole(): 創建新角色
// - updateRole(): 更新角色資訊
// - deleteRole(): 刪除角色
// - getRole(): 獲取角色詳情
// - getAllRoles(): 獲取所有角色
// - getRolePermissions(): 獲取角色權限
// - setRolePermissions(): 設定角色權限
// - getRoleHierarchy(): 獲取角色層級
// - validateRole(): 驗證角色定義
//
// 角色層級結構：
// - 超級管理員（Super Admin）
// - 系統管理員（System Admin）
// - 功能管理員（Feature Admin）
// - 一般用戶（Regular User）
// - 訪客用戶（Guest User）
//
// 權限繼承機制：
// - 向下繼承：上級角色繼承下級權限
// - 向上繼承：下級角色繼承上級權限
// - 橫向繼承：同級角色間權限共享
// - 條件繼承：基於條件的權限繼承
//
// 依賴服務：
// - Firestore: 角色資料儲存
// - PermissionService: 權限管理
// - PermissionCacheService: 權限快取
// - RoleAssignmentService: 角色指派
//
// 未來擴展：
// - 支援角色版本控制
// - 支援角色工作流程
// - 支援角色審計日誌
// - 支援角色遷移工具
// - 支援角色備份還原
