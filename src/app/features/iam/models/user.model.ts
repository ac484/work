// 用戶相關資料模型定義
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  roles: string[];
  permissions?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface UserSession {
  uid: string;
  sessionId: string;
  loginAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserFilter {
  roles?: string[];
  isActive?: boolean;
  department?: string;
  searchTerm?: string;
}

export interface UserListItem {
  uid: string;
  email: string;
  displayName?: string;
  roles: string[];
  isActive: boolean;
  lastLoginAt?: Date;
}