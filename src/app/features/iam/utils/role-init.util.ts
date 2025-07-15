// IAM 角色初始化工具
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { DEFAULT_ROLE_PERMISSIONS } from '../../../core/constants/permissions';
import { Role } from '../models/role.model';

// 使用統一的權限常數，轉換為可變陣列
export const ADMIN_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.admin];
export const MANAGER_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.manager];
export const FINANCE_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.finance];
export const USER_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.user];
export const GUEST_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.guest];

export const ALL_ROLE_IDS = ['admin', 'manager', 'finance', 'user', 'guest'] as const;
export type RoleId = typeof ALL_ROLE_IDS[number];

// 預設角色配置
export const DEFAULT_ROLES: Record<RoleId, Omit<Role, 'createdAt' | 'updatedAt'>> = {
  admin: {
    id: 'admin',
    name: '系統管理員',
    description: '擁有系統最高權限，可管理所有功能',
    permissions: ADMIN_DEFAULT_PERMISSIONS,
    isSystem: true
  },
  manager: {
    id: 'manager',
    name: '專案管理者',
    description: '專案/部門管理者，可管理合約和審核請款',
    permissions: MANAGER_DEFAULT_PERMISSIONS,
    isSystem: true
  },
  finance: {
    id: 'finance',
    name: '財務人員',
    description: '財務相關操作權限，處理請款和發票',
    permissions: FINANCE_DEFAULT_PERMISSIONS,
    isSystem: true
  },
  user: {
    id: 'user',
    name: '一般用戶',
    description: '基本用戶權限，可檢視合約和提交請款',
    permissions: USER_DEFAULT_PERMISSIONS,
    isSystem: true
  },
  guest: {
    id: 'guest',
    name: '訪客',
    description: '訪客權限，僅可檢視基本資訊',
    permissions: GUEST_DEFAULT_PERMISSIONS,
    isSystem: true
  }
};

/**
 * 確保管理員角色存在並具有最新權限
 */
export async function ensureAdminRole(firestore: Firestore): Promise<void> {
  const adminRef = doc(firestore, 'roles', 'admin');
  const snap = await getDoc(adminRef);
  
  const adminRole = DEFAULT_ROLES.admin;
  const now = new Date();
  
  if (!snap.exists()) {
    // 創建新的管理員角色
    await setDoc(adminRef, {
      ...adminRole,
      createdAt: now,
      updatedAt: now
    });
    console.log('✅ 管理員角色已創建');
  } else {
    // 更新現有角色權限
    const data = snap.data();
    if (!data) return;
    
    const existingPerms: string[] = Array.isArray(data['permissions']) ? data['permissions'] : [];
    const newPerms = Array.from(new Set([...existingPerms, ...adminRole.permissions]));
    
    // 檢查是否需要更新
    const needsUpdate = 
      newPerms.length !== existingPerms.length ||
      data['name'] !== adminRole.name ||
      data['description'] !== adminRole.description ||
      !data['isSystem'];
    
    if (needsUpdate) {
      await setDoc(adminRef, {
        ...adminRole,
        permissions: newPerms,
        createdAt: data['createdAt'] || now,
        updatedAt: now
      }, { merge: true });
      console.log('✅ 管理員角色已更新');
    }
  }
}

/**
 * 確保指定角色存在並具有最新權限
 */
async function ensureRole(firestore: Firestore, roleId: RoleId): Promise<void> {
  const roleRef = doc(firestore, 'roles', roleId);
  const snap = await getDoc(roleRef);
  
  const roleConfig = DEFAULT_ROLES[roleId];
  const now = new Date();
  
  if (!snap.exists()) {
    // 創建新角色
    await setDoc(roleRef, {
      ...roleConfig,
      createdAt: now,
      updatedAt: now
    });
    console.log(`✅ 角色 ${roleConfig.name} (${roleId}) 已創建`);
  } else {
    // 更新現有角色
    const data = snap.data();
    if (!data) return;
    
    const existingPerms: string[] = Array.isArray(data['permissions']) ? data['permissions'] : [];
    const newPerms = Array.from(new Set([...existingPerms, ...roleConfig.permissions]));
    
    // 檢查是否需要更新
    const needsUpdate = 
      newPerms.length !== existingPerms.length ||
      data['name'] !== roleConfig.name ||
      data['description'] !== roleConfig.description ||
      !data['isSystem'];
    
    if (needsUpdate) {
      await setDoc(roleRef, {
        ...roleConfig,
        permissions: newPerms,
        createdAt: data['createdAt'] || now,
        updatedAt: now
      }, { merge: true });
      console.log(`✅ 角色 ${roleConfig.name} (${roleId}) 已更新`);
    }
  }
}

/**
 * 初始化所有系統角色
 */
export async function ensureAllRoles(firestore: Firestore): Promise<void> {
  console.log('🔄 開始初始化系統角色...');
  
  try {
    // 並行初始化所有角色
    await Promise.all([
      ensureAdminRole(firestore),
      ensureRole(firestore, 'manager'),
      ensureRole(firestore, 'finance'),
      ensureRole(firestore, 'user'),
      ensureRole(firestore, 'guest')
    ]);
    
    console.log('✅ 所有系統角色初始化完成');
  } catch (error) {
    console.error('❌ 角色初始化失敗:', error);
    throw error;
  }
}

/**
 * 檢查角色是否存在
 */
export async function checkRoleExists(firestore: Firestore, roleId: string): Promise<boolean> {
  const roleRef = doc(firestore, 'roles', roleId);
  const snap = await getDoc(roleRef);
  return snap.exists();
}

/**
 * 獲取角色統計資訊
 */
export async function getRoleStats(firestore: Firestore): Promise<{
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
}> {
  const stats = {
    totalRoles: 0,
    systemRoles: 0,
    customRoles: 0
  };
  
  // 檢查每個預設角色
  for (const roleId of ALL_ROLE_IDS) {
    const exists = await checkRoleExists(firestore, roleId);
    if (exists) {
      stats.totalRoles++;
      stats.systemRoles++;
    }
  }
  
  return stats;
}

/**
 * 重置所有系統角色到預設狀態
 */
export async function resetSystemRoles(firestore: Firestore): Promise<void> {
  console.log('🔄 重置系統角色到預設狀態...');
  
  try {
    const now = new Date();
    
    // 重置所有系統角色
    const resetPromises = ALL_ROLE_IDS.map(async (roleId) => {
      const roleRef = doc(firestore, 'roles', roleId);
      const roleConfig = DEFAULT_ROLES[roleId];
      
      await setDoc(roleRef, {
        ...roleConfig,
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`✅ 角色 ${roleConfig.name} (${roleId}) 已重置`);
    });
    
    await Promise.all(resetPromises);
    console.log('✅ 所有系統角色重置完成');
  } catch (error) {
    console.error('❌ 角色重置失敗:', error);
    throw error;
  }
}