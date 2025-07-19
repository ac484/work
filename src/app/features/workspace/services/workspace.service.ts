// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
// 極簡主義：僅提供 mock 資料查詢
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Workspace } from '../models';
import { MockDataService } from './mock/mock-data.service';

/**
 * 工作區管理服務
 * 負責工作區的 CRUD 操作
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
      return this.mockDataService.simulateCollectionQuery(
        this.mockDataService.getMockWorkspaces()
      );
    }
    const q = query(this.workspacesCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Workspace[]>;
  }

  /**
   * 根據 ID 獲取工作區
   */
  getWorkspaceById(id: string): Observable<Workspace | undefined> {
    if (this.isDevelopmentMode) {
      return this.mockDataService.simulateDocumentQuery(
        this.mockDataService.getMockWorkspaces(),
        id
      );
    }
    const workspaceDoc = doc(this.firestore, 'workspaces', id);
    return docData(workspaceDoc, { idField: 'id' }) as Observable<Workspace | undefined>;
  }

  /**
   * 創建新工作區
   */
  async createWorkspace(workspace: Omit<Workspace, 'id'>): Promise<string> {
    if (this.isDevelopmentMode) {
      const mockWorkspaces = this.mockDataService.getMockWorkspaces();
      return await this.mockDataService.simulateAddDocument(mockWorkspaces, workspace).toPromise() || '';
    }
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
    if (this.isDevelopmentMode) {
      const mockWorkspaces = this.mockDataService.getMockWorkspaces();
      await this.mockDataService.simulateUpdateDocument(mockWorkspaces, id, updates).toPromise();
      return;
    }
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
    if (this.isDevelopmentMode) {
      const mockWorkspaces = this.mockDataService.getMockWorkspaces();
      await this.mockDataService.simulateDeleteDocument(mockWorkspaces, id).toPromise();
      return;
    }
    const workspaceDoc = doc(this.firestore, 'workspaces', id);
    await deleteDoc(workspaceDoc);
  }
}
