import { WorkspaceTask, WorkspaceLocationNode, Workspace } from '../models';

/**
 * 工作區驗證相關工具函數
 */

/**
 * 驗證工作區名稱
 */
export function validateWorkspaceName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '工作區名稱不能為空' };
  }
  
  if (name.length < 2) {
    return { valid: false, message: '工作區名稱至少需要2個字元' };
  }
  
  if (name.length > 50) {
    return { valid: false, message: '工作區名稱不能超過50個字元' };
  }
  
  return { valid: true };
}

/**
 * 驗證工作區編號
 */
export function validateWorkspaceCode(code: string): { valid: boolean; message?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: false, message: '工作區編號不能為空' };
  }
  
  // 編號格式：字母數字組合，可包含連字符和底線
  const codePattern = /^[A-Za-z0-9_-]+$/;
  if (!codePattern.test(code)) {
    return { valid: false, message: '工作區編號只能包含字母、數字、連字符和底線' };
  }
  
  if (code.length < 2 || code.length > 20) {
    return { valid: false, message: '工作區編號長度應在2-20個字元之間' };
  }
  
  return { valid: true };
}

/**
 * 驗證任務標題
 */
export function validateTaskTitle(title: string): { valid: boolean; message?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: '任務標題不能為空' };
  }
  
  if (title.length < 2) {
    return { valid: false, message: '任務標題至少需要2個字元' };
  }
  
  if (title.length > 100) {
    return { valid: false, message: '任務標題不能超過100個字元' };
  }
  
  return { valid: true };
}

/**
 * 驗證任務進度
 */
export function validateTaskProgress(progress: number): { valid: boolean; message?: string } {
  if (progress < 0 || progress > 100) {
    return { valid: false, message: '任務進度必須在0-100之間' };
  }
  
  if (!Number.isInteger(progress)) {
    return { valid: false, message: '任務進度必須是整數' };
  }
  
  return { valid: true };
}

/**
 * 驗證任務日期範圍
 */
export function validateTaskDateRange(startDate?: string, endDate?: string): { valid: boolean; message?: string } {
  if (!startDate || !endDate) {
    return { valid: true }; // 日期是可選的
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: '日期格式不正確' };
  }
  
  if (start >= end) {
    return { valid: false, message: '開始日期必須早於結束日期' };
  }
  
  return { valid: true };
}

/**
 * 驗證位置節點名稱
 */
export function validateLocationNodeName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: '位置節點名稱不能為空' };
  }
  
  if (name.length < 1) {
    return { valid: false, message: '位置節點名稱至少需要1個字元' };
  }
  
  if (name.length > 50) {
    return { valid: false, message: '位置節點名稱不能超過50個字元' };
  }
  
  return { valid: true };
}

/**
 * 驗證位置節點類型
 */
export function validateLocationNodeType(nodeType: string): { valid: boolean; message?: string } {
  const validTypes = ['root', 'branch', 'leaf'];
  
  if (!validTypes.includes(nodeType)) {
    return { valid: false, message: '位置節點類型必須是 root、branch 或 leaf' };
  }
  
  return { valid: true };
}

/**
 * 驗證任務依賴關係（避免循環依賴）
 */
export function validateTaskDependencies(
  taskId: string, 
  dependencies: string[], 
  allTasks: WorkspaceTask[]
): { valid: boolean; message?: string } {
  
  // 檢查是否依賴自己
  if (dependencies.includes(taskId)) {
    return { valid: false, message: '任務不能依賴自己' };
  }
  
  // 檢查循環依賴
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(currentTaskId: string): boolean {
    if (recursionStack.has(currentTaskId)) {
      return true; // 發現循環
    }
    
    if (visited.has(currentTaskId)) {
      return false; // 已經檢查過，沒有循環
    }
    
    visited.add(currentTaskId);
    recursionStack.add(currentTaskId);
    
    const currentTask = allTasks.find(t => t.id === currentTaskId);
    if (currentTask && currentTask.dependencies) {
      for (const depId of currentTask.dependencies) {
        if (hasCycle(depId)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(currentTaskId);
    return false;
  }
  
  // 模擬添加依賴後檢查循環
  const tempTask = allTasks.find(t => t.id === taskId);
  if (tempTask) {
    const originalDeps = tempTask.dependencies || [];
    tempTask.dependencies = [...originalDeps, ...dependencies];
    
    const hasCycleResult = hasCycle(taskId);
    
    // 恢復原始依賴
    tempTask.dependencies = originalDeps;
    
    if (hasCycleResult) {
      return { valid: false, message: '任務依賴會造成循環依賴，請檢查依賴關係' };
    }
  }
  
  return { valid: true };
}

/**
 * 驗證工作區完整性
 */
export function validateWorkspace(workspace: Partial<Workspace>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 驗證名稱
  const nameValidation = validateWorkspaceName(workspace.name || '');
  if (!nameValidation.valid) {
    errors.push(nameValidation.message!);
  }
  
  // 驗證編號
  const codeValidation = validateWorkspaceCode(workspace.code || '');
  if (!codeValidation.valid) {
    errors.push(codeValidation.message!);
  }
  
  // 驗證日期
  if (workspace.startDate && workspace.endDate) {
    const dateValidation = validateTaskDateRange(workspace.startDate, workspace.endDate);
    if (!dateValidation.valid) {
      errors.push(dateValidation.message!);
    }
  }
  
  // 驗證進度
  if (workspace.progress !== undefined) {
    const progressValidation = validateTaskProgress(workspace.progress);
    if (!progressValidation.valid) {
      errors.push(progressValidation.message!);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 驗證任務完整性
 */
export function validateTask(task: Partial<WorkspaceTask>, allTasks: WorkspaceTask[] = []): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 驗證標題
  const titleValidation = validateTaskTitle(task.title || '');
  if (!titleValidation.valid) {
    errors.push(titleValidation.message!);
  }
  
  // 驗證進度
  if (task.progress !== undefined) {
    const progressValidation = validateTaskProgress(task.progress);
    if (!progressValidation.valid) {
      errors.push(progressValidation.message!);
    }
  }
  
  // 驗證日期範圍
  const dateValidation = validateTaskDateRange(task.startDate, task.endDate);
  if (!dateValidation.valid) {
    errors.push(dateValidation.message!);
  }
  
  // 驗證依賴關係
  if (task.id && task.dependencies && task.dependencies.length > 0) {
    const depValidation = validateTaskDependencies(task.id, task.dependencies, allTasks);
    if (!depValidation.valid) {
      errors.push(depValidation.message!);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}