// 本檔案集中定義合約、請款、變更、成員等所有型別
// 功能：型別安全、結構清晰，供所有合約相關元件與服務共用
// 用途：合約管理模組的型別定義中心
import { Timestamp } from '@angular/fire/firestore';

// ===== 請款狀態：描述請款流程目前所處的階段 =====
export type PaymentStatus =
  | '草稿'     // 尚未送出
  | '待審核'   // 使用者送出後，一律視為「待審核」
  | '待放款'   // 審核通過後，直接視為待放款（包含開票階段）
  | '放款中'   // 系統正在執行放款
  | '完成'     // 放款完成
  | '拒絕';    // 任何階段被拒絕均歸入此

// ===== 請款操作：用戶可對請款單執行的動作 =====
export type PaymentAction =
  | '送出'       // 從「草稿」直接送到「待審核」
  | '撤回'       // 從「待審核」或「待放款」撤回到「草稿」
  | '下一步'     // 根據當前狀態自動往下走
  | '拒絕'       // 拒絕就直接到「拒絕」
  | '重新申請';  // 從「拒絕」回到「草稿」

// ===== 狀態轉移對應表：定義每個狀態可執行哪些操作，以及操作後的新狀態 =====
export type StatusTransitionMap = {
  [K in PaymentStatus]?: Partial<Record<PaymentAction, PaymentStatus>>;
};

// ===== 請款流程狀態轉移表 =====
export const PAYMENT_STATUS_TRANSITIONS: StatusTransitionMap = {
  草稿: {
    送出: '待審核', //用戶送出
  },
  待審核: {
    撤回: '草稿', //用戶撤回後，回到草稿
    下一步: '待放款', //審核通過後，直接視為待放款（包含開票階段）
    拒絕: '拒絕', //審核不通過，直接視為拒絕
  },
  待放款: {
    撤回: '草稿', //用戶撤回後，回到草稿
    下一步: '放款中', //審核通過後，直接視為待放款（包含開票階段）
    拒絕: '拒絕', //審核不通過，直接視為拒絕
  },
  放款中: {
    下一步: '完成', //放款完成後，直接視為完成
    拒絕: '拒絕', //放款不通過，直接視為拒絕
  },
  完成: {}, //完成後，不再有任何操作
  拒絕: { //審核不通過，直接視為拒絕
    重新申請: '草稿', //用戶重新申請後，回到草稿
  },
};

// ===== 歷程記錄：紀錄每次請款操作的詳細資訊 =====
export interface PaymentLog {
  action: PaymentAction;   // 操作名稱
  user: string;            // 操作人
  timestamp: string;       // 操作時間（ISO 格式）
  note?: string;           // 備註
}

// ===== 請款紀錄：單次請款的所有資訊 =====
export interface PaymentRecord {
  round: number;             // 請款輪次
  status: PaymentStatus;     // 請款狀態
  percent: number;           // 請款百分比
  amount: number;            // 請款金額
  applicant: string;         // 請款人
  date: string;              // 請款日期 (ISO 格式)
  note?: string;             // 備註
  verifier?: string;         // 審核人
  financeApprover?: string;  // 放款審核人
  approvedAt?: string;       // 審核完成時間 (ISO 格式)
  paymentDate?: string;      // 實際放款日期 (ISO 格式)
  invoiceNumber?: string;    // 發票號碼
  files: string[];           // 附件 (發票、申請單等)
  logs: PaymentLog[];        // 歷程記錄
}

// ===== 合約金額變更紀錄：追加/追減金額 =====
export interface ChangeRecord {
  type: '追加' | '追減';      // 變更類型
  amount: number;            // 變更金額
  note?: string;             // 備註
  date: string;              // 變更日期 (ISO 格式)
  user: string;              // 變更操作人
}

// ===== 合約成員：參與合約的成員資訊 =====
export interface ContractMember {
  userId?: string;           // 使用者 ID
  name: string;              // 成員姓名
  role: string;              // 成員角色
}

// ===== 合約主體：完整合約資訊 =====
export interface Contract {
  id?: string;               // Firestore 文件 id
  code: string;              // 合約編號
  client: string;            // 業主
  status: '進行中' | '已完成' | '已終止'; // 合約狀態
  orderNo?: string;          // 訂單編號
  orderDate?: string;        // 訂單日期 (ISO 格式)
  projectNo?: string;        // 專案編號
  projectName?: string;      // 專案名稱
  contractAmount: number;    // 合約金額
  pendingPercent: number;    // 尚未請款百分比
  invoicedAmount: number;    // 已開立金額
  paymentRound: number;      // 請款輪次
  paymentPercent: number;    // 請款百分比
  paymentStatus: PaymentStatus; // 請款狀態
  invoiceStatus: '未開票' | '已開票'; // 發票狀態
  note?: string;             // 備註
  url?: string;              // 檔案下載連結
  payments: PaymentRecord[]; // 請款紀錄
  changes: ChangeRecord[];   // 變更紀錄
  members: ContractMember[]; // 合約成員
  tags: string[];            // 合約標籤
}

// ===== 合約留言訊息：合約討論區訊息型別 =====
export interface Message {
  id?: string;                   // Firestore 文件 id
  contractId: string;            // 所屬合約 id
  user: string;                  // 發言人
  message: string;               // 訊息內容
  createdAt: Timestamp | Date;   // Firestore Timestamp 或 JS Date
}

// ===== 合約篩選條件：用於查詢合約列表 =====
export interface ContractFilter {
  client?: string;               // 業主
  code?: string;                 // 合約編號
  orderNo?: string;              // 訂單編號
  projectNo?: string;            // 專案編號
  status?: Contract['status'];   // 合約狀態
  projectName?: string;          // 專案名稱
  minAmount?: number;            // 金額下限
  maxAmount?: number;            // 金額上限
  tags?: string[];               // 合約標籤
  dateFrom?: string;             // 合約日期範圍起 (ISO 格式)
  dateTo?: string;               // 合約日期範圍迄 (ISO 格式)
}

// ===== 合約列表項目：合約列表顯示用精簡資訊 =====
export interface ContractListItem {
  id: string;                   // 合約 id
  code: string;                 // 合約編號
  status: Contract['status'];   // 合約狀態
  projectName: string;          // 專案名稱
  contractAmount: number;       // 合約金額
  tags: string[];               // 合約標籤
  url?: string;                 // 檔案下載連結
}

// ===== 使用者資訊：登入用戶的基本資料 =====
export interface UserInfo {
  userId: string;               // 使用者唯一識別
  displayName?: string;         // 顯示名稱
  email?: string;               // 電子郵件
}

// ===== 時間線事件：合約、變更、請款等紀錄顯示用 =====
export interface TimelineEvent {
  label: string;                // 事件標題
  date: string;                 // 事件日期 (ISO 格式)
  type: 'change' | 'payment' | 'contract';   // 事件類型
  severity?: 'success' | 'info' | 'warning' | 'danger'; // 事件嚴重程度
}