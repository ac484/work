// 角色服務 - 處理角色 CRUD 操作
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Role, RoleFilter, RoleListItem } from '../../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private firestore = inject(Firestore);
  private rolesCollection = collection(this.firestore, 'roles');

  getRoles(): Observable<Role[]> {
    return collectionData(this.rolesCollection, { idField: 'id' }) as Observable<Role[]>;
  }

  getRoleById(roleId: string): Observable<Role | undefined> {
    return this.getRoles().pipe(
      map(roles => roles.find(role => role.id === roleId))
    );
  }

  async createRole(roleData: Partial<Role>): Promise<void> {
    if (!roleData.id) {
      throw new Error('Role ID is required');
    }

    const roleDoc = doc(this.firestore, 'roles', roleData.id);
    const newRole: Role = {
      id: roleData.id,
      name: roleData.name || roleData.id,
      description: roleData.description || '',
      permissions: roleData.permissions || [],
      isSystem: roleData.isSystem ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(roleDoc, newRole);
  }

  async updateRole(roleId: string, roleData: Partial<Role>): Promise<void> {
    const roleDoc = doc(this.firestore, 'roles', roleId);
    const updateData = {
      ...roleData,
      updatedAt: new Date()
    };
    await updateDoc(roleDoc, updateData);
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.getRoleById(roleId).pipe(map(r => r)).toPromise();
    if (role?.isSystem) {
      throw new Error('Cannot delete system role');
    }
    
    const roleDoc = doc(this.firestore, 'roles', roleId);
    await deleteDoc(roleDoc);
  }

  async addPermissionToRole(roleId: string, permission: string): Promise<void> {
    const role = await this.getRoleById(roleId).pipe(map(r => r)).toPromise();
    if (role && !role.permissions.includes(permission)) {
      await this.updateRole(roleId, {
        permissions: [...role.permissions, permission]
      });
    }
  }

  async removePermissionFromRole(roleId: string, permission: string): Promise<void> {
    const role = await this.getRoleById(roleId).pipe(map(r => r)).toPromise();
    if (role) {
      await this.updateRole(roleId, {
        permissions: role.permissions.filter(p => p !== permission)
      });
    }
  }

  filterRoles(roles: Role[], filter?: RoleFilter): RoleListItem[] {
    if (!filter) {
      return roles.map(this.mapToListItem);
    }

    let filtered = roles;

    if (filter.isSystem !== undefined) {
      filtered = filtered.filter(role => role.isSystem === filter.isSystem);
    }

    if (filter.hasPermission) {
      filtered = filtered.filter(role => 
        role.permissions.includes(filter.hasPermission!)
      );
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term)
      );
    }

    return filtered.map(this.mapToListItem);
  }

  private mapToListItem(role: Role): RoleListItem {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissionCount: role.permissions.length,
      userCount: 0, // 需要從用戶服務獲取
      isSystem: role.isSystem
    };
  }
}