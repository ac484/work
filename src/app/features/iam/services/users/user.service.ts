// 用戶服務 - 處理用戶 CRUD 操作
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { User, UserFilter, UserListItem } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  getUsers(): Observable<User[]> {
    return collectionData(this.usersCollection, { idField: 'uid' }) as Observable<User[]>;
  }

  getUserById(uid: string): Observable<User | undefined> {
    return this.getUsers().pipe(
      map(users => users.find(user => user.uid === uid))
    );
  }

  async createUser(userData: Partial<User>): Promise<void> {
    if (!userData.uid) {
      throw new Error('User UID is required');
    }

    const userDoc = doc(this.firestore, 'users', userData.uid);
    const newUser: User = {
      uid: userData.uid,
      email: userData.email || '',
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      roles: userData.roles || [],
      permissions: userData.permissions || [],
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: userData.lastLoginAt
    };

    await setDoc(userDoc, newUser);
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<void> {
    const userDoc = doc(this.firestore, 'users', uid);
    const updateData = {
      ...userData,
      updatedAt: new Date()
    };
    await updateDoc(userDoc, updateData);
  }

  async deleteUser(uid: string): Promise<void> {
    const userDoc = doc(this.firestore, 'users', uid);
    await deleteDoc(userDoc);
  }

  async assignRoles(uid: string, roleIds: string[]): Promise<void> {
    await this.updateUser(uid, { roles: roleIds });
  }

  async addRole(uid: string, roleId: string): Promise<void> {
    const user = await this.getUserById(uid).pipe(map(u => u)).toPromise();
    if (user && !user.roles.includes(roleId)) {
      await this.assignRoles(uid, [...user.roles, roleId]);
    }
  }

  async removeRole(uid: string, roleId: string): Promise<void> {
    const user = await this.getUserById(uid).pipe(map(u => u)).toPromise();
    if (user) {
      await this.assignRoles(uid, user.roles.filter(r => r !== roleId));
    }
  }

  filterUsers(users: User[], filter?: UserFilter): UserListItem[] {
    if (!filter) {
      return users.map(this.mapToListItem);
    }

    let filtered = users;

    if (filter.roles && filter.roles.length > 0) {
      filtered = filtered.filter(user => 
        filter.roles!.some(role => user.roles.includes(role))
      );
    }

    if (filter.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === filter.isActive);
    }

    if (filter.department) {
      // 假設部門資訊存在用戶資料中
      filtered = filtered.filter(user => 
        (user as any).department === filter.department
      );
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(term) ||
        (user.displayName && user.displayName.toLowerCase().includes(term))
      );
    }

    return filtered.map(this.mapToListItem);
  }

  private mapToListItem(user: User): UserListItem {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    };
  }
}