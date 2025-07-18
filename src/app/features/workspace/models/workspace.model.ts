// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
// 用於工地多專案進度管理的核心型別定義

/**
 * 工地（單一工地/現場）主體
 * 包含成員、日誌、任務、日曆事件、安全事件、空間結構等所有工地管理核心資料
 */
export interface Workspace {
  id?: string;
  name: string;                // 工地名稱
  code: string;                // 工地編號
  status: '未開始' | '進行中' | '已完成' | '已終止';
  startDate: string;
  endDate?: string;
  progress: number;
  members: WorkspaceMember[];              // 工地成員
  logs: WorkspaceLog[];                    // 工地日誌
  tasks: WorkspaceTask[];                  // 工地任務
  calendarEvents: WorkspaceCalendarEvent[];// 工地日曆事件
  safetyEvents: WorkspaceSafetyEvent[];    // 工地安全事件
  tags?: string[];
  description?: string;
  createdAt: string;
  updatedAt?: string;
  locations?: WorkspaceLocationNode[];      // 工地空間結構
}

/**
 * 工地空間結構節點
 * 用戶自訂名稱與層級，支援 root/branch/leaf 樹狀結構，適用於描述工地、工廠、園區等多層級空間
 */
export interface WorkspaceLocationNode {
  id: string;
  workspaceId?: string;
  name: string;                // 用戶自訂名稱
  nodeType: 'root' | 'branch' | 'leaf'; // 根/枝/葉
  parentId?: string;           // 上層節點 id
  code?: string;               // 用戶自訂編號
  note?: string;
}

/**
 * 工地成員
 * 工地/任務等層級的參與人員資訊
 */
export interface WorkspaceMember {
  userId?: string;
  name: string;
  role: string;
}

/**
 * 工地任務
 * 用於任務分派、出工、排程、進度管理、甘特圖等
 * 支援多區域（locationId）與多任務依賴（dependencies）
 */
export interface WorkspaceTask {
  id?: string;                  // Firestore 文件 id
  workspaceId?: string;         // 所屬工地 id（可選）
  title: string;                // 任務/工項名稱
  description?: string;         // 任務說明
  status: '待處理' | '進行中' | '已完成' | '已取消';
  assignees: WorkspaceMember[]; // 出工人員
  locationId?: string;          // 對應空間節點（如 leaf 節點）
  startDate?: string;           // 預定開始日 (ISO 格式)
  endDate?: string;             // 預定結束日 (ISO 格式)
  actualStart?: string;         // 實際開始日
  actualEnd?: string;           // 實際結束日
  progress?: number;            // 進度百分比
  hours?: number;               // 工時
  dependencies?: string[];      // 依賴的任務 id 陣列（前置任務）
  logs?: WorkspaceLog[];        // 任務日誌
  photos?: string[];            // 出工照片
  note?: string;
  createdAt: string;            // 建立時間 (ISO 格式)
  updatedAt?: string;           // 更新時間 (ISO 格式)
}

/**
 * 工地日曆事件
 * 會議、檢查、交付、重要時程提醒等
 */
export interface WorkspaceCalendarEvent {
  id?: string;
  workspaceId?: string;
  title: string;
  description?: string;
  start: string; // ISO 格式
  end?: string;  // ISO 格式
  allDay?: boolean;
  createdBy: string;
  createdAt: string;
}

/**
 * 工地日誌
 * 工地、任務等層級的活動紀錄，支援照片、內容、時間等
 */
export interface WorkspaceLog {
  id?: string;
  workspaceId?: string;
  user: string;
  action: string;             // 操作/事件名稱
  content?: string;           // 日誌內容
  timestamp: string;          // ISO 格式
  photos?: string[];          // 照片 URL 陣列
  note?: string;
}

/**
 * 工地安全事件
 * 安全巡檢、事故通報、改善追蹤等
 */
export interface WorkspaceSafetyEvent {
  id?: string;
  workspaceId?: string;
  type: '巡檢' | '事故' | '改善';
  description: string;
  reportedBy: string;
  reportedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  note?: string;
  photos?: string[]; // 安全事件相關照片
}