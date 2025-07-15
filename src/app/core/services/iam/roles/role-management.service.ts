// 🚨 此服務已遷移至新的 IAM 模組
// 新路徑: src/app/features/iam/services/roles/role.service.ts
// 請使用新的 IamFacadeService 進行角色管理

// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, getDocs, CollectionReference, DocumentData, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { ensureAllRoles } from './role-init';

export interface Role {
  id: string;
  permissions: string[];
  description: string;
  identity?: string | string[]; // 新增，支援多身分
}

@Injectable({ providedIn: 'root' })
export class RoleManagementService {
  private firestore = inject(Firestore);
  private rolesCol: CollectionReference<DocumentData> = collection(this.firestore, 'roles');

  constructor() {
    ensureAllRoles(this.firestore); // 啟動時自動檢查/建立所有角色
  }

  getAllRoles(): Observable<Role[]> {
    return from(
      getDocs(this.rolesCol).then(snapshot =>
        snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Role))
      )
    );
  }

  upsertRole(role: Role): Promise<void> {
    const ref = doc(this.rolesCol, role.id);
    // 新增 identity 欄位
    return setDoc(ref, { permissions: role.permissions, description: role.description, identity: role.identity }, { merge: true });
  }

  deleteRole(roleId: string): Promise<void> {
    const ref = doc(this.rolesCol, roleId);
    return deleteDoc(ref);
  }
}
