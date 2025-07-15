// 權限相關工具函數
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';

/**
 * 檢查用戶是否擁有特定權限
 */
export function hasPermission(user: User, permission: string): boolean {
  // 檢查直接權限
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }

  // 檢查角色權限（需要角色資料）
  // 這裡簡化實現，實際應該查詢角色的權限
  return false;
}

/**
 * 檢查用戶是否擁有任一權限
 */
export function hasAnyPermission(user: User, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * 檢查用戶是否擁有所有權限
 */
export function hasAllPermissions(user: User, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * 獲取用戶的所有權限（包含角色權限）
 */
export function getUserAllPermissions(user: User, roles: Role[]): string[] {
  const directPermissions = user.permissions || [];
  const rolePermissions = user.roles
    .map(roleId => roles.find(r => r.id === roleId))
    .filter(Boolean)
    .flatMap(role => role!.permissions);

  // 去重並返回
  return [...new Set([...directPermissions, ...rolePermissions])];
}

/**
 * 權限分組
 */
export function groupPermissionsByCategory(permissions: string[]): { [category: string]: string[] } {
  const groups: { [category: string]: string[] } = {
    contract: [],
    payment: [],
    management: [],
    other: []
  };

  permissions.forEach(permission => {
    if (permission.includes('contract')) {
      groups.contract.push(permission);
    } else if (permission.includes('payment')) {
      groups.payment.push(permission);
    } else if (permission.includes('manage') || permission.includes('finance')) {
      groups.management.push(permission);
    } else {
      groups.other.push(permission);
    }
  });

  return groups;
}

/**
 * 權限標籤轉換
 */
export function getPermissionLabel(permission: string): string {
  const labels: { [key: string]: string } = {
    'view_contract': '檢視合約',
    'create_contract': '新增合約',
    'edit_contract': '編輯合約',
    'delete_contract': '刪除合約',
    'create_payment_request': '新增請款申請',
    'submit_payment_request': '送出請款申請',
    'cancel_own_payment': '撤回自己的請款申請',
    'review_payment': '審核請款申請',
    'approve_payment': '通過請款申請',
    'reject_payment': '拒絕請款申請',
    'issue_invoice': '開立發票',
    'process_payment': '處理請款',
    'complete_payment': '完成請款',
    'manage_roles': '管理角色',
    'view_finance': '檢視財務',
    'comment_contract': '留言',
    'upload_file': '上傳檔案'
  };
  
  return labels[permission] || permission;
}

/**
 * 權限圖示對應
 */
export function getPermissionIcon(permission: string): string {
  if (permission.includes('view')) return 'pi pi-eye';
  if (permission.includes('create')) return 'pi pi-plus';
  if (permission.includes('edit')) return 'pi pi-pencil';
  if (permission.includes('delete')) return 'pi pi-trash';
  if (permission.includes('manage')) return 'pi pi-cog';
  if (permission.includes('payment')) return 'pi pi-money-bill';
  if (permission.includes('contract')) return 'pi pi-file';
  return 'pi pi-key';
}

/**
 * 權限嚴重性等級
 */
export function getPermissionSeverity(permission: string): 'success' | 'info' | 'warning' | 'danger' {
  if (permission.includes('delete') || permission.includes('manage')) return 'danger';
  if (permission.includes('edit') || permission.includes('approve')) return 'warning';
  if (permission.includes('create') || permission.includes('submit')) return 'info';
  return 'success';
}

/**
 * 檢查權限衝突
 */
export function checkPermissionConflicts(permissions: string[]): string[] {
  const conflicts: string[] = [];
  
  // 檢查是否同時擁有創建和刪除權限但沒有編輯權限
  if (permissions.includes('create_contract') && 
      permissions.includes('delete_contract') && 
      !permissions.includes('edit_contract')) {
    conflicts.push('擁有創建和刪除權限但缺少編輯權限');
  }

  // 檢查是否擁有審核權限但沒有檢視權限
  if (permissions.includes('review_payment') && 
      !permissions.includes('view_contract')) {
    conflicts.push('擁有審核權限但缺少檢視權限');
  }

  return conflicts;
}