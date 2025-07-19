import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Workspace, WorkspaceLocationNode, WorkspaceTask, WorkspaceMember } from '../../models';
import { MOCK_WORKSPACES } from '../../mock-workspace.data';

/**
 * 模擬資料服務
 * 模擬 Firestore 的查詢行為，使用 mock-workspace.data.ts 作為資料來源
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {

  /**
   * 獲取模擬工作區資料
   */
  getMockWorkspaces(): Workspace[] {
    return MOCK_WORKSPACES;
  }

  /**
   * 根據工作區 ID 獲取對應的位置節點
   */
  getMockLocationNodesByWorkspace(workspaceId: string): WorkspaceLocationNode[] {
    const workspace = MOCK_WORKSPACES.find(w => w.id === workspaceId);
    return workspace?.locations || [];
  }

  /**
   * 根據位置 ID 獲取對應的任務
   */
  getMockTasksByLocation(locationId: string): WorkspaceTask[] {
    // 從所有工作區中找出對應位置的任務
    const allTasks: WorkspaceTask[] = [];
    MOCK_WORKSPACES.forEach(workspace => {
      allTasks.push(...workspace.tasks);
    });
    
    // 篩選出指定位置的任務
    return allTasks.filter(task => task.locationId === locationId);
  }

  /**
   * 根據工作區 ID 獲取任務
   */
  getMockTasksByWorkspace(workspaceId: string): WorkspaceTask[] {
    const workspace = MOCK_WORKSPACES.find(w => w.id === workspaceId);
    return workspace?.tasks || [];
  }

  /**
   * 模擬 Firestore 查詢延遲
   */
  private simulateFirestoreDelay<T>(data: T): Observable<T> {
    return of(data).pipe(delay(100 + Math.random() * 200)); // 100-300ms 隨機延遲
  }

  /**
   * 模擬 Firestore collection 查詢
   */
  simulateCollectionQuery<T>(
    collection: T[],
    filters?: { field: string; operator: string; value: any }[]
  ): Observable<T[]> {
    let filteredData = [...collection];

    // 套用篩選條件
    if (filters) {
      filters.forEach(filter => {
        filteredData = filteredData.filter(item => {
          const fieldValue = (item as any)[filter.field];
          switch (filter.operator) {
            case '==':
              return fieldValue === filter.value;
            case '!=':
              return fieldValue !== filter.value;
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(fieldValue);
            case 'array-contains':
              return Array.isArray(fieldValue) && fieldValue.includes(filter.value);
            default:
              return true;
          }
        });
      });
    }

    return this.simulateFirestoreDelay(filteredData);
  }

  /**
   * 模擬 Firestore document 查詢
   */
  simulateDocumentQuery<T>(
    collection: T[],
    documentId: string
  ): Observable<T | undefined> {
    const document = collection.find(item => (item as any).id === documentId);
    return this.simulateFirestoreDelay(document);
  }

  /**
   * 模擬 Firestore 新增文件
   */
  simulateAddDocument<T>(
    collection: T[],
    document: Omit<T, 'id'>
  ): Observable<string> {
    const newId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDocument = { ...document, id: newId } as T;
    collection.push(newDocument);
    return this.simulateFirestoreDelay(newId);
  }

  /**
   * 模擬 Firestore 更新文件
   */
  simulateUpdateDocument<T>(
    collection: T[],
    documentId: string,
    updates: Partial<T>
  ): Observable<void> {
    const index = collection.findIndex(item => (item as any).id === documentId);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...updates };
    }
    return this.simulateFirestoreDelay(undefined);
  }

  /**
   * 模擬 Firestore 刪除文件
   */
  simulateDeleteDocument<T>(
    collection: T[],
    documentId: string
  ): Observable<void> {
    const index = collection.findIndex(item => (item as any).id === documentId);
    if (index !== -1) {
      collection.splice(index, 1);
    }
    return this.simulateFirestoreDelay(undefined);
  }
}