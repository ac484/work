import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, shareReplay, of } from 'rxjs';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Workspace, WorkspaceTask, WorkspaceLocationNode, WorkspaceLog, WorkspaceCalendarEvent, WorkspaceSafetyEvent } from '../../models';
import { MockDataService } from '../mock/mock-data.service';

/**
 * 工作區核心資料服務
 * 負責與 Firebase Firestore 的基礎 CRUD 操作
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private firestore = inject(Firestore);
  private mockDataService = inject(MockDataService);
  private workspacesCollection = collection(this.firestore, 'workspaces');
  
  // 開發模式切換（生產環境請設為 false）
  private readonly isDevelopmentMode = true;

  /**
   * 獲取所有工作區
   */
  getWorkspaces(): Observable<Workspace[]> {
    if (this.isDevelopmentMode) {
      return of(this.mockDataService.getMockWorkspaces());
    }
    return collectionData(this.workspacesCollection, { idField: 'id' }) as Observable<Workspace[]>;
  }

  /**
   * 根據 ID 獲取單一工作區
   */
  getWorkspaceById(id: string): Observable<Workspace | undefined> {
    const workspaceDoc = doc(this.firestore, 'workspaces', id);
    return docData(workspaceDoc, { idField: 'id' }) as Observable<Workspace | undefined>;
  }

  /**
   * 創建新工作區
   */
  async createWorkspace(workspace: Omit<Workspace, 'id'>): Promise<string> {
    const docRef = await addDoc(this.workspacesCollection, {
      ...workspace,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  /**
   * 更新工作區
   */
  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<void> {
    const workspaceDoc = doc(this.firestore, 'workspaces', id);
    await updateDoc(workspaceDoc, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * 刪除工作區
   */
  async deleteWorkspace(id: string): Promise<void> {
    const workspaceDoc = doc(this.firestore, 'workspaces', id);
    await deleteDoc(workspaceDoc);
  }

  /**
   * 根據狀態篩選工作區
   */
  getWorkspacesByStatus(status: Workspace['status']): Observable<Workspace[]> {
    const q = query(this.workspacesCollection, where('status', '==', status));
    return collectionData(q, { idField: 'id' }) as Observable<Workspace[]>;
  }
}