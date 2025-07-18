import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, map, shareReplay, distinctUntilChanged, switchMap, of } from 'rxjs';
import { WorkspaceService } from './workspace.service';
import { LocationTreeService } from '../location/location-tree.service';
import { TaskService } from '../task/task.service';
import { Workspace, WorkspaceLocationNode, WorkspaceTask } from '../../models';

/**
 * 工作區門面服務 (Facade Pattern)
 * 統一的業務邏輯入口，整合各專門服務，提供集中式狀態管理
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceFacadeService {
  // 注入各專門服務
  private workspaceService = inject(WorkspaceService);
  private locationTreeService = inject(LocationTreeService);
  private taskService = inject(TaskService);

  // 集中式狀態管理
  private selectedWorkspaceId$ = new BehaviorSubject<string | null>(null);
  private selectedLocationId$ = new BehaviorSubject<string | null>(null);

  // 快取的資料流
  private workspaces$ = this.workspaceService.getWorkspaces().pipe(shareReplay(1));

  /**
   * 獲取所有工作區
   */
  getWorkspaces(): Observable<Workspace[]> {
    return this.workspaces$;
  }

  /**
   * 設置當前選中的工作區
   */
  setSelectedWorkspace(workspaceId: string | null): void {
    this.selectedWorkspaceId$.next(workspaceId);
    // 清除位置選擇
    this.selectedLocationId$.next(null);
  }

  /**
   * 獲取當前選中的工作區 ID
   */
  getSelectedWorkspaceId(): Observable<string | null> {
    return this.selectedWorkspaceId$.asObservable();
  }

  /**
   * 獲取當前選中的工作區詳情
   */
  getSelectedWorkspace(): Observable<Workspace | undefined> {
    return combineLatest([this.workspaces$, this.selectedWorkspaceId$]).pipe(
      map(([workspaces, selectedId]) => 
        selectedId ? workspaces.find(w => w.id === selectedId) : undefined
      ),
      distinctUntilChanged()
    );
  }

  /**
   * 獲取當前工作區的位置樹狀結構
   */
  getCurrentWorkspaceLocationTree(): Observable<WorkspaceLocationNode[]> {
    return this.selectedWorkspaceId$.pipe(
      switchMap(workspaceId => 
        workspaceId ? this.locationTreeService.buildLocationTree(workspaceId) : of([])
      ),
      shareReplay(1)
    );
  }

  /**
   * 設置當前選中的位置節點
   */
  setSelectedLocation(locationId: string | null): void {
    this.selectedLocationId$.next(locationId);
    this.locationTreeService.setSelectedNode(locationId);
  }

  /**
   * 獲取當前選中的位置 ID
   */
  getSelectedLocationId(): Observable<string | null> {
    return this.selectedLocationId$.asObservable();
  }

  /**
   * 獲取當前位置的任務列表
   */
  getCurrentLocationTasks(): Observable<WorkspaceTask[]> {
    return combineLatest([this.selectedWorkspaceId$, this.selectedLocationId$]).pipe(
      switchMap(([workspaceId, locationId]) => {
        if (locationId) {
          return this.taskService.getTasksByLocation(locationId);
        } else if (workspaceId) {
          return this.taskService.getTasksByWorkspace(workspaceId);
        }
        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * 獲取當前工作區的任務統計
   */
  getCurrentWorkspaceTaskStatistics(): Observable<any> {
    return this.selectedWorkspaceId$.pipe(
      switchMap(workspaceId => 
        workspaceId ? this.taskService.getTaskStatistics(workspaceId) : of(null)
      ),
      shareReplay(1)
    );
  }

  /**
   * 創建新工作區
   */
  async createWorkspace(workspace: Omit<Workspace, 'id'>): Promise<string> {
    return await this.workspaceService.createWorkspace(workspace);
  }

  /**
   * 更新工作區
   */
  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<void> {
    await this.workspaceService.updateWorkspace(id, updates);
  }

  /**
   * 創建位置節點
   */
  async createLocationNode(node: Omit<WorkspaceLocationNode, 'id'>): Promise<string> {
    return await this.locationTreeService.createLocationNode(node);
  }

  /**
   * 創建任務
   */
  async createTask(task: Omit<WorkspaceTask, 'id'>): Promise<string> {
    return await this.taskService.createTask(task);
  }

  /**
   * 更新任務狀態
   */
  async updateTaskStatus(taskId: string, status: WorkspaceTask['status']): Promise<void> {
    await this.taskService.updateTaskStatus(taskId, status);
  }

  /**
   * 更新任務進度
   */
  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    await this.taskService.updateTaskProgress(taskId, progress);
  }

  /**
   * 獲取工作區概覽資訊
   */
  getWorkspaceOverview(): Observable<{
    workspace: Workspace | undefined;
    locationCount: number;
    taskStatistics: any;
  }> {
    return combineLatest([
      this.getSelectedWorkspace(),
      this.getCurrentWorkspaceLocationTree(),
      this.getCurrentWorkspaceTaskStatistics()
    ]).pipe(
      map(([workspace, locations, taskStats]) => ({
        workspace,
        locationCount: locations.length,
        taskStatistics: taskStats
      }))
    );
  }
}