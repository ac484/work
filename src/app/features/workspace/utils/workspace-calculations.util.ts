import { WorkspaceTask, Workspace } from '../models';

/**
 * 工作區計算相關工具函數
 */

/**
 * 計算任務的完成百分比
 */
export function calculateTaskProgress(tasks: WorkspaceTask[]): number {
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
  return Math.round(totalProgress / tasks.length);
}

/**
 * 計算工作區整體進度
 */
export function calculateWorkspaceProgress(workspace: Workspace): number {
  if (!workspace.tasks || workspace.tasks.length === 0) return 0;
  
  return calculateTaskProgress(workspace.tasks);
}

/**
 * 計算任務延遲天數
 */
export function calculateTaskDelay(task: WorkspaceTask): number {
  if (!task.endDate || task.status === '已完成') return 0;
  
  const endDate = new Date(task.endDate);
  const now = new Date();
  const diffTime = now.getTime() - endDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * 計算任務剩餘天數
 */
export function calculateRemainingDays(task: WorkspaceTask): number {
  if (!task.endDate || task.status === '已完成') return 0;
  
  const endDate = new Date(task.endDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * 計算任務工期（天數）
 */
export function calculateTaskDuration(task: WorkspaceTask): number {
  if (!task.startDate || !task.endDate) return 0;
  
  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * 計算實際工期
 */
export function calculateActualDuration(task: WorkspaceTask): number {
  if (!task.actualStart) return 0;
  
  const startDate = new Date(task.actualStart);
  const endDate = task.actualEnd ? new Date(task.actualEnd) : new Date();
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * 檢查任務是否逾期
 */
export function isTaskOverdue(task: WorkspaceTask): boolean {
  if (!task.endDate || task.status === '已完成') return false;
  
  const endDate = new Date(task.endDate);
  const now = new Date();
  
  return now > endDate;
}

/**
 * 檢查任務是否即將到期（3天內）
 */
export function isTaskDueSoon(task: WorkspaceTask): boolean {
  if (!task.endDate || task.status === '已完成') return false;
  
  const endDate = new Date(task.endDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 3 && diffDays > 0;
}

/**
 * 獲取任務狀態統計
 */
export function getTaskStatusStatistics(tasks: WorkspaceTask[]) {
  const stats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    dueSoon: 0
  };

  tasks.forEach(task => {
    switch (task.status) {
      case '待處理':
        stats.pending++;
        break;
      case '進行中':
        stats.inProgress++;
        break;
      case '已完成':
        stats.completed++;
        break;
      case '已取消':
        stats.cancelled++;
        break;
    }

    if (isTaskOverdue(task)) {
      stats.overdue++;
    } else if (isTaskDueSoon(task)) {
      stats.dueSoon++;
    }
  });

  return stats;
}