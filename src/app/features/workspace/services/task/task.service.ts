import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { WorkspaceTask } from '../../models';
import { MockDataService } from '../mock/mock-data.service';

/**
 * 工作區任務管理服務
 * 負責任務的 CRUD 操作
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore = inject(Firestore);
  private mockDataService = inject(MockDataService);
  private tasksCollection = collection(this.firestore, 'workspace-tasks');
  
  // 開發模式切換（生產環境請設為 false）
  private readonly isDevelopmentMode = true;

  /**
   * 獲取指定工作區的所有任務
   */
  getTasksByWorkspace(workspaceId: string): Observable<WorkspaceTask[]> {
    if (this.isDevelopmentMode) {
      const tasks = this.mockDataService.getMockTasksByWorkspace(workspaceId);
      return this.mockDataService.simulateCollectionQuery(tasks);
    }
    const q = query(
      this.tasksCollection,
      where('workspaceId', '==', workspaceId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceTask[]>;
  }

  /**
   * 獲取指定位置的所有任務
   */
  getTasksByLocation(locationId: string): Observable<WorkspaceTask[]> {
    if (this.isDevelopmentMode) {
      const tasks = this.mockDataService.getMockTasksByLocation(locationId);
      return this.mockDataService.simulateCollectionQuery(tasks);
    }
    const q = query(
      this.tasksCollection,
      where('locationId', '==', locationId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceTask[]>;
  }

  /**
   * 根據 ID 獲取任務
   */
  getTaskById(id: string): Observable<WorkspaceTask | undefined> {
    if (this.isDevelopmentMode) {
      // 從所有工作區中找出對應的任務
      const allTasks: WorkspaceTask[] = [];
      this.mockDataService.getMockWorkspaces().forEach(workspace => {
        if (workspace.tasks) {
          allTasks.push(...workspace.tasks);
        }
      });
      return this.mockDataService.simulateDocumentQuery(allTasks, id);
    }
    const taskDoc = doc(this.firestore, 'workspace-tasks', id);
    return docData(taskDoc, { idField: 'id' }) as Observable<WorkspaceTask | undefined>;
  }

  /**
   * 創建新任務
   */
  async createTask(task: Omit<WorkspaceTask, 'id'>): Promise<string> {
    if (this.isDevelopmentMode) {
      // 模擬新增到對應工作區的任務列表
      const workspace = this.mockDataService.getMockWorkspaces().find(w => w.id === task.workspaceId);
      if (workspace && workspace.tasks) {
        const newId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTask = { ...task, id: newId } as WorkspaceTask;
        workspace.tasks.push(newTask);
        return newId;
      }
      return '';
    }
    const docRef = await addDoc(this.tasksCollection, {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  /**
   * 更新任務
   */
  async updateTask(id: string, updates: Partial<WorkspaceTask>): Promise<void> {
    if (this.isDevelopmentMode) {
      // 模擬更新對應工作區的任務
      const allWorkspaces = this.mockDataService.getMockWorkspaces();
      for (const workspace of allWorkspaces) {
        if (workspace.tasks) {
          const taskIndex = workspace.tasks.findIndex(task => task.id === id);
          if (taskIndex !== -1) {
            workspace.tasks[taskIndex] = { ...workspace.tasks[taskIndex], ...updates };
            break;
          }
        }
      }
      return;
    }
    const taskDoc = doc(this.firestore, 'workspace-tasks', id);
    await updateDoc(taskDoc, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * 刪除任務
   */
  async deleteTask(id: string): Promise<void> {
    if (this.isDevelopmentMode) {
      // 模擬刪除對應工作區的任務
      const allWorkspaces = this.mockDataService.getMockWorkspaces();
      for (const workspace of allWorkspaces) {
        if (workspace.tasks) {
          const taskIndex = workspace.tasks.findIndex(task => task.id === id);
          if (taskIndex !== -1) {
            workspace.tasks.splice(taskIndex, 1);
            break;
          }
        }
      }
      return;
    }
    const taskDoc = doc(this.firestore, 'workspace-tasks', id);
    await deleteDoc(taskDoc);
  }

  /**
   * 獲取任務統計資訊
   */
  getTaskStatistics(workspaceId: string): Observable<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }> {
    return this.getTasksByWorkspace(workspaceId).pipe(
      map((tasks: WorkspaceTask[]) => {
        const total = tasks.length;
        const completed = tasks.filter((task: WorkspaceTask) => task.status === '已完成').length;
        const inProgress = tasks.filter((task: WorkspaceTask) => task.status === '進行中').length;
        const pending = tasks.filter((task: WorkspaceTask) => task.status === '待處理').length;
        
        return { total, completed, inProgress, pending };
      })
    );
  }
}