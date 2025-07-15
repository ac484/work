# 🔄 舊版 IAM 系統遷移指南

## 📋 遷移狀態總覽

### ✅ 已完成遷移的服務

| 舊路徑 | 新路徑 | 狀態 | 說明 |
|--------|--------|------|------|
| `src/app/core/services/iam/users/user.service.ts` | `src/app/features/iam/services/users/user.service.ts` | ✅ 已遷移 | 用戶管理服務 |
| `src/app/core/services/iam/roles/role-management.service.ts` | `src/app/features/iam/services/roles/role.service.ts` | ✅ 已遷移 | 角色管理服務 |
| `src/app/core/services/iam/permissions/permission.service.ts` | `src/app/features/iam/services/permissions/permission.service.ts` | ✅ 已遷移 | 權限檢查服務 |
| `src/app/core/services/iam/permissions/permission.guard.ts` | `src/app/features/iam/services/permissions/permission.guard.ts` | ✅ 已遷移 | 權限守衛 |

### 🔧 保留的功能模組

| 路徑 | 狀態 | 說明 |
|------|------|------|
| `src/app/core/services/iam/roles/role-init.ts` | 🔧 保留 | 角色初始化邏輯，仍被新系統使用 |
| `src/app/core/services/iam/permissions/permission-monitoring.interceptor.ts` | 🔧 保留 | HTTP 權限監控攔截器 |
| `src/app/core/services/iam/permissions/permission-monitor.service.ts` | 🔧 保留 | 權限監控服務 |

## 🚀 新 IAM 系統架構

### 統一入口 - IamFacadeService
```typescript
// 使用新的門面服務
import { IamFacadeService } from './features/iam/services/core/iam-facade.service';

// 替代舊的多個服務注入
constructor(private iamFacade: IamFacadeService) {}

// 統一的 API 調用
this.iamFacade.getCurrentUser()
this.iamFacade.getUsers()
this.iamFacade.getRoles()
this.iamFacade.checkPermission()
```

### 新的路由結構
```
/iam/users          - 用戶管理
/iam/users/profile  - 個人資料
/iam/roles          - 角色管理
/iam/permissions    - 權限管理
```

## 📝 遷移步驟

### 1. 更新服務注入
```typescript
// 舊方式
import { UserService } from '../core/services/iam/users/user.service';
import { RoleManagementService } from '../core/services/iam/roles/role-management.service';
import { PermissionService } from '../core/services/iam/permissions/permission.service';

// 新方式
import { IamFacadeService } from '../features/iam/services/core/iam-facade.service';
```

### 2. 更新路由引用
```typescript
// 舊路由
'/roles' → '/iam/roles'
'/permission-monitor' → '/iam/permissions/monitor'
'/users' → '/iam/users'
```

### 3. 更新組件導入
```typescript
// 新的組件導入
import { UserAvatarComponent, RoleBadgeComponent } from '../features/iam';
```

## ⚠️ 注意事項

1. **舊服務文件已標記為遷移狀態**，但仍可運行以保持向後兼容
2. **新系統使用門面模式**，提供統一的 API 接口
3. **路由自動重定向**，舊路由會自動導向新系統
4. **權限監控功能保留**，繼續使用現有的監控服務

## 🔮 未來計劃

1. **完善守衛系統** - 實現完整的認證和權限守衛
2. **移除舊文件** - 在確認新系統穩定後移除舊服務文件
3. **增強監控** - 整合權限監控到新的 IAM 系統中

---

**遷移完成日期**: 2025年1月  
**新系統架構**: 門面模式 + 分層架構  
**技術棧**: Angular v20 + PrimeNG 20.0.0-rc.3 + @angular/fire