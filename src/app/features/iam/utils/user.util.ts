// 用戶相關工具函數
import { User, UserListItem } from '../models/user.model';

/**
 * 獲取用戶顯示名稱
 */
export function getUserDisplayName(user: User | UserListItem): string {
  return user.displayName || user.email || '未知用戶';
}

/**
 * 獲取用戶頭像縮寫
 */
export function getUserInitials(user: User | UserListItem): string {
  const name = user.displayName || user.email || '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * 檢查用戶是否為活躍狀態
 */
export function isActiveUser(user: User): boolean {
  return user.isActive;
}

/**
 * 檢查用戶是否為新用戶（7天內註冊）
 */
export function isNewUser(user: User): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return user.createdAt > sevenDaysAgo;
}

/**
 * 檢查用戶最近是否有登入（30天內）
 */
export function hasRecentLogin(user: User): boolean {
  if (!user.lastLoginAt) return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return user.lastLoginAt > thirtyDaysAgo;
}

/**
 * 獲取用戶狀態標籤
 */
export function getUserStatusLabel(user: User): string {
  if (!user.isActive) return '已停用';
  if (isNewUser(user)) return '新用戶';
  if (!hasRecentLogin(user)) return '長期未登入';
  return '正常';
}

/**
 * 獲取用戶狀態顏色
 */
export function getUserStatusSeverity(user: User): 'success' | 'info' | 'warning' | 'danger' {
  if (!user.isActive) return 'danger';
  if (isNewUser(user)) return 'info';
  if (!hasRecentLogin(user)) return 'warning';
  return 'success';
}

/**
 * 格式化用戶角色列表
 */
export function formatUserRoles(roles: string[]): string {
  if (roles.length === 0) return '無角色';
  if (roles.length === 1) return roles[0];
  if (roles.length <= 3) return roles.join(', ');
  return `${roles.slice(0, 2).join(', ')} 等 ${roles.length} 個角色`;
}

/**
 * 用戶搜尋匹配
 */
export function matchesUserSearch(user: User, searchTerm: string): boolean {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase();
  return (
    user.email.toLowerCase().includes(term) ||
    (user.displayName && user.displayName.toLowerCase().includes(term)) ||
    user.roles.some(role => role.toLowerCase().includes(term))
  );
}

/**
 * 用戶排序比較函數
 */
export function compareUsers(a: User, b: User, sortBy: 'name' | 'email' | 'createdAt' | 'lastLoginAt' = 'name'): number {
  switch (sortBy) {
    case 'name':
      const nameA = getUserDisplayName(a);
      const nameB = getUserDisplayName(b);
      return nameA.localeCompare(nameB);
    
    case 'email':
      return a.email.localeCompare(b.email);
    
    case 'createdAt':
      return b.createdAt.getTime() - a.createdAt.getTime(); // 新的在前
    
    case 'lastLoginAt':
      if (!a.lastLoginAt && !b.lastLoginAt) return 0;
      if (!a.lastLoginAt) return 1; // 沒有登入記錄的排後面
      if (!b.lastLoginAt) return -1;
      return b.lastLoginAt.getTime() - a.lastLoginAt.getTime(); // 最近登入的在前
    
    default:
      return 0;
  }
}

/**
 * 生成用戶摘要
 */
export function generateUserSummary(user: User): string {
  const status = getUserStatusLabel(user);
  const roleCount = user.roles.length;
  const permissionCount = user.permissions?.length || 0;
  
  return `${status}，擁有 ${roleCount} 個角色，${permissionCount} 個直接權限`;
}

/**
 * 檢查用戶資料完整性
 */
export function checkUserDataCompleteness(user: User): {
  isComplete: boolean;
  missingFields: string[];
  completionRate: number;
} {
  const requiredFields = ['email', 'displayName'];
  const optionalFields = ['photoURL'];
  const allFields = [...requiredFields, ...optionalFields];
  
  const missingFields: string[] = [];
  let filledCount = 0;
  
  requiredFields.forEach(field => {
    if (!user[field as keyof User]) {
      missingFields.push(field);
    } else {
      filledCount++;
    }
  });
  
  optionalFields.forEach(field => {
    if (user[field as keyof User]) {
      filledCount++;
    }
  });
  
  const completionRate = Math.round((filledCount / allFields.length) * 100);
  const isComplete = missingFields.length === 0;
  
  return { isComplete, missingFields, completionRate };
}

/**
 * 驗證用戶電子郵件格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 生成用戶唯一識別碼
 */
export function generateUserUID(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 用戶資料脫敏
 */
export function sanitizeUserData(user: User): Partial<User> {
  return {
    uid: user.uid,
    email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // 郵件部分隱藏
    displayName: user.displayName,
    roles: user.roles,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}