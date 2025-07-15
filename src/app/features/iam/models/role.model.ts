// 角色相關資料模型定義
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface RoleFilter {
  isSystem?: boolean;
  hasPermission?: string;
  searchTerm?: string;
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  userCount: number;
  isSystem: boolean;
}