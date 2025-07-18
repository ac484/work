// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { DEFAULT_ROLE_PERMISSIONS } from '../../../constants/permissions';

// 使用統一的權限常數，轉換為可變陣列
export const ADMIN_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.admin];
export const MANAGER_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.manager];
export const FINANCE_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.finance];
export const USER_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.user];
export const GUEST_DEFAULT_PERMISSIONS = [...DEFAULT_ROLE_PERMISSIONS.guest];

export const ALL_ROLE_IDS = ['admin', 'manager', 'finance', 'user', 'guest'] as const;
export type RoleId = typeof ALL_ROLE_IDS[number];

export async function ensureAdminRole(firestore: Firestore): Promise<void> {
  const adminRef = doc(firestore, 'roles', 'admin');
  const snap = await getDoc(adminRef);
  if (!snap.exists()) {
    await setDoc(adminRef, {
      permissions: ADMIN_DEFAULT_PERMISSIONS,
      description: '系統管理員',
      identity: 'admin'
    });
  } else {
    const data = snap.data();
    if (!data) return;
    const perms: string[] = Array.isArray(data['permissions']) ? data['permissions'] : [];
    const newPerms = Array.from(new Set([...perms, ...ADMIN_DEFAULT_PERMISSIONS]));
    if (newPerms.length !== perms.length || data['identity'] !== 'admin') {
      await setDoc(adminRef, { ...data, permissions: newPerms, identity: 'admin' }, { merge: true });
    }
  }
}

async function ensureRole(firestore: Firestore, roleId: string, permissions: string[], description: string, identity: string): Promise<void> {
  const ref = doc(firestore, 'roles', roleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { permissions, description, identity });
  } else {
    const data = snap.data();
    if (!data) return;
    const perms: string[] = Array.isArray(data['permissions']) ? data['permissions'] : [];
    const newPerms = Array.from(new Set([...perms, ...permissions]));
    if (newPerms.length !== perms.length || data['identity'] !== identity) {
      await setDoc(ref, { ...data, permissions: newPerms, identity }, { merge: true });
    }
  }
}

export async function ensureAllRoles(firestore: Firestore): Promise<void> {
  await ensureAdminRole(firestore);
  await ensureRole(firestore, 'manager', MANAGER_DEFAULT_PERMISSIONS, '專案/部門管理者', 'manager');
  await ensureRole(firestore, 'finance', FINANCE_DEFAULT_PERMISSIONS, '財務人員', 'finance');
  await ensureRole(firestore, 'user', USER_DEFAULT_PERMISSIONS, '一般用戶', 'user');
  await ensureRole(firestore, 'guest', GUEST_DEFAULT_PERMISSIONS, '訪客', 'guest');
} 