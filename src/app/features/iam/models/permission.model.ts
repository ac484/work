// 權限相關資料模型定義
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface PermissionCheck {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  granted: boolean;
  reason?: string;
  timestamp: Date;
}

export interface PermissionMatrix {
  roleId: string;
  permissions: string[];
}

export interface ResourcePermission {
  resourceType: string;
  resourceId: string;
  userId: string;
  permissions: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}