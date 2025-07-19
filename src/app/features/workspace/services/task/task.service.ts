import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, combineLatest, of } from 'rxjs';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { WorkspaceTask, WorkspaceLog } from '../../models';
import { MockDataService } from '../mock/mock-data.service';

/**
 * 工作區任務管理服務
 * 負責任務的 CRUD 操作、狀態管理、進度追蹤等
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private firestore = inject(Firestore);
  private mockDataService = inject(MockDataService);
  private tasksCollection = collection(this.firestore, 'workspace-tasks');
  private logsCollection = collection(this.firestore, 'workspace-logs');
  
  // 開發模式切換（生產環境請設為 false）
  private readonly isDevelopmentMode = true;

  /**
   * 獲取指定工作區的所有任務
   */
  getTasksByWorkspace(workspaceId: string): Observable<WorkspaceTask[]> {
    if (this.isDevelopmentMode) {
      return of(this.mockDataService.getMockTasks(workspaceId));
    }
    const q = query(
      this.tasksCollection,
      where('workspaceId', '==', workspaceId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceTask[]>;
  }

  /**
   * 獲取指定位置的任務
   */
  getTasksByLocation(locationId: string): Observable<WorkspaceTask[]> {
    if (this.isDevelopmentMode) {
      return of(this.mockDataService.getMockTasksByLocation(locationId));
    }
    const q = query(
      this.tasksCollection,
      where('locationId', '==', locationId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceTask[]>;
  }

  /**
   * 根據狀態獲取任務
   */
  getTasksByStatus(workspaceId: string, status: WorkspaceTask['status']): Observable<WorkspaceTask[]> {
    const q = query(
      this.tasksCollection,
      where('workspaceId', '==', workspaceId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceTask[]>;
  }

  /**
   * 根據 ID 獲取單一任務
   */
  getTaskById(id: string): Observable<WorkspaceTask | undefined> {
    const taskDoc = doc(this.firestore, 'workspace-tasks', id);
    return docData(taskDoc, { idField: 'id' }) as Observable<WorkspaceTask | undefined>;
  }

  /**
   * 創建新任務
   */
  async createTask(task: Omit<WorkspaceTask, 'id'>): Promise<string> {
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
    const taskDoc = doc(this.firestore, 'workspace-tasks', id);
    await deleteDoc(taskDoc);
  }

  /**
   * 更新任務狀態
   */
  async updateTaskStatus(id: string, status: WorkspaceTask['status']): Promise<void> {
    const updates: Partial<WorkspaceTask> = { status };
    
    // 如果狀態變為已完成，記錄實際結束時間
    if (status === '已完成') {
      updates.actualEnd = new Date().toISOString();
      updates.progress = 100;
    }
    
    // 如果狀態變為進行中，記錄實際開始時間
    if (status === '進行中' && !updates.actualStart) {
      updates.actualStart = new Date().toISOString();
    }

    await this.updateTask(id, updates);
  }

  /**
   * 更新任務進度
   */
  async updateTaskProgress(id: string, progress: number): Promise<void> {
    const updates: Partial<WorkspaceTask> = { progress };
    
    // 自動更新狀態
    if (progress === 0) {
      updates.status = '待處理';
    } else if (progress === 100) {
      updates.status = '已完成';
      updates.actualEnd = new Date().toISOString();
    } else {
      updates.status = '進行中';
      if (!updates.actualStart) {
        updates.actualStart = new Date().toISOString();
      }
    }

    await this.updateTask(id, updates);
  }

  /**
   * 為任務添加日誌
   */
  async addTaskLog(taskId: string, log: Omit<WorkspaceLog, 'id'>): Promise<string> {
    const docRef = await addDoc(this.logsCollection, {
      ...log,
      timestamp: new Date().toISOString()
    });

    // 同時更新任務的日誌陣列
    const task = await this.getTaskById(taskId).pipe(map(t => t)).toPromise();
    if (task) {
      const updatedLogs = [...(task.logs || []), { ...log, id: docRef.id }];
      await this.updateTask(taskId, { logs: updatedLogs });
    }

    return docRef.id;
  }

  /**
   * 獲取任務統計資訊
   */
  getTaskStatistics(workspaceId: string): Observable<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overallProgress: number;
  }> {
    return this.getTasksByWorkspace(workspaceId).pipe(
      map(tasks => {
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === '待處理').length;
        const inProgress = tasks.filter(t => t.status === '進行中').length;
        const completed = tasks.filter(t => t.status === '已完成').length;
        const cancelled = tasks.filter(t => t.status === '已取消').length;
        
        const overallProgress = total > 0 
          ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / total)
          : 0;

        return {
          total,
          pending,
          inProgress,
          completed,
          cancelled,
          overallProgress
        };
      })
    );
  }
}