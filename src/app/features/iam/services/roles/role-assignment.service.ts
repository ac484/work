// 角色指派服務 - 處理用戶角色指派記錄
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData, doc, setDoc, query, where, orderBy } from '@angular/fire/firestore';
import { RoleAssignment } from '../../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleAssignmentService {
  private firestore = inject(Firestore);
  private assignmentsCollection = collection(this.firestore, 'roleAssignments');

  async assignRole(userId: string, roleId: string, assignedBy: string, expiresAt?: Date): Promise<void> {
    const assignmentId = `${userId}_${roleId}`;
    const assignmentDoc = doc(this.firestore, 'roleAssignments', assignmentId);
    
    const assignment: RoleAssignment = {
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt
    };

    await setDoc(assignmentDoc, assignment);
  }

  getUserRoleAssignments(userId: string): Observable<RoleAssignment[]> {
    const q = query(
      this.assignmentsCollection,
      where('userId', '==', userId),
      orderBy('assignedAt', 'desc')
    );
    return collectionData(q) as Observable<RoleAssignment[]>;
  }

  getRoleAssignments(roleId: string): Observable<RoleAssignment[]> {
    const q = query(
      this.assignmentsCollection,
      where('roleId', '==', roleId),
      orderBy('assignedAt', 'desc')
    );
    return collectionData(q) as Observable<RoleAssignment[]>;
  }

  getAllAssignments(): Observable<RoleAssignment[]> {
    const q = query(
      this.assignmentsCollection,
      orderBy('assignedAt', 'desc')
    );
    return collectionData(q) as Observable<RoleAssignment[]>;
  }
}