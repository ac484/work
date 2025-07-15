// 角色相關工具函數
import { Role } from '../models/role.model';
import { User } from '../models/user.model';

/**
 * 檢查用戶是否擁有特定角色
 */
export function hasRole(user: User, roleId: string): boolean {
  return user.roles.includes(roleId);
}

/**
 * 檢查用戶是否擁有任一角色
 */
export function hasAnyRole(user: User, roleIds: string[]): boolean {
  return roleIds.some(roleId => user.roles.includes(roleId));
}

/**
 * 檢查用戶是否擁有所有角色
 */
export function hasAllRoles(user: User, roleIds: string[]): boolean {
  return roleIds.every(roleId => user.roles.includes(roleId));
}

/**
 * 獲取角色顯示名稱
 */
export function getRoleDisplayName(role: Role): string {
  return role.name || role.id;
}

/**
 * 獲取角色圖示
 */
export function getRoleIcon(roleId: string): string {
  const icons: { [key: string]: string } = {
    'admin': 'pi pi-crown',
    'manager': 'pi pi-briefcase',
    'finance': 'pi pi-calculator',
    'user': 'pi pi-user',
    'guest': 'pi pi-eye'
  };
  
  return icons[roleId] || 'pi pi-users';
}

/**
 * 獲取角色顏色嚴重性
 */
export function getRoleSeverity(roleId: string, isSystem: boolean = false): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  if (isSystem) return 'warning';
  
  const severities: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
    'admin': 'danger',
    'manager': 'info',
    'finance': 'warning',
    'user': 'success',
    'guest': 'secondary'
  };
  
  return severities[roleId] || 'secondary';
}

/**
 * 角色優先級排序
 */
export function sortRolesByPriority(roles: Role[]): Role[] {
  const priorityOrder = ['admin', 'manager', 'finance', 'user', 'guest'];
  
  return roles.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a.id);
    const bPriority = priorityOrder.indexOf(b.id);
    
    // 如果角色不在優先級列表中，放到最後
    if (aPriority === -1 && bPriority === -1) {
      return a.name.localeCompare(b.name);
    }
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    
    return aPriority - bPriority;
  });
}

/**
 * 檢查角色層級關係
 */
export function isHigherRole(roleA: string, roleB: string): boolean {
  const hierarchy = ['admin', 'manager', 'finance', 'user', 'guest'];
  const indexA = hierarchy.indexOf(roleA);
  const indexB = hierarchy.indexOf(roleB);
  
  // 如果角色不在層級中，認為是同級
  if (indexA === -1 || indexB === -1) return false;
  
  return indexA < indexB;
}

/**
 * 獲取角色的有效權限數量
 */
export function getEffectivePermissionCount(role: Role): number {
  return role.permissions.length;
}

/**
 * 檢查角色是否可以被刪除
 */
export function canDeleteRole(role: Role, userCount: number): { canDelete: boolean; reason?: string } {
  if (role.isSystem) {
    return { canDelete: false, reason: '系統角色無法刪除' };
  }
  
  if (userCount > 0) {
    return { canDelete: false, reason: `仍有 ${userCount} 個用戶使用此角色` };
  }
  
  return { canDelete: true };
}

/**
 * 生成角色摘要
 */
export function generateRoleSummary(role: Role, userCount: number): string {
  const permissionCount = role.permissions.length;
  const type = role.isSystem ? '系統角色' : '自定義角色';
  
  return `${type}，擁有 ${permissionCount} 個權限，${userCount} 個用戶使用`;
}

/**
 * 角色權限差異比較
 */
export function compareRolePermissions(roleA: Role, roleB: Role): {
  onlyInA: string[];
  onlyInB: string[];
  common: string[];
} {
  const setA = new Set(roleA.permissions);
  const setB = new Set(roleB.permissions);
  
  const onlyInA = roleA.permissions.filter(p => !setB.has(p));
  const onlyInB = roleB.permissions.filter(p => !setA.has(p));
  const common = roleA.permissions.filter(p => setB.has(p));
  
  return { onlyInA, onlyInB, common };
}

/**
 * 建議角色權限
 */
export function suggestRolePermissions(roleId: string): string[] {
  const suggestions: { [key: string]: string[] } = {
    'admin': [
      'view_contract', 'create_contract', 'edit_contract', 'delete_contract',
      'manage_roles', 'view_finance', 'comment_contract', 'upload_file'
    ],
    'manager': [
      'view_contract', 'create_contract', 'edit_contract',
      'review_payment', 'comment_contract', 'upload_file'
    ],
    'finance': [
      'view_contract', 'view_finance', 'review_payment', 'approve_payment',
      'reject_payment', 'issue_invoice', 'process_payment', 'complete_payment',
      'comment_contract'
    ],
    'user': [
      'view_contract', 'create_payment_request', 'submit_payment_request',
      'cancel_own_payment', 'comment_contract', 'upload_file'
    ],
    'guest': ['view_contract']
  };
  
  return suggestions[roleId] || [];
}