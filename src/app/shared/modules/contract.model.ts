// 合約相關型別集中管理

// 請款狀態
export type PaymentStatus =
  | '初始'
  | '申請中'
  | '審核中'
  | '開票中'
  | '放款中'
  | '完成'
  | '已拒絕';

// 請款操作
export type PaymentAction =
  | '送出'
  | '取消'
  | '撤回'
  | '送審'
  | '退回'
  | '開票'
  | '放款'
  | '完成'
  | '拒絕'
  | '重新申請';

// 狀態轉移對應表：每個狀態可對應哪些操作，操作後會進入哪個新狀態
export type StatusTransitionMap = {
  [K in PaymentStatus]?: Partial<Record<PaymentAction, PaymentStatus>>;
};

// 實際範例，可直接用於請款流程控制
export const PAYMENT_STATUS_TRANSITIONS: StatusTransitionMap = {
  初始: {
    送出: '申請中',
    取消: '已拒絕',
  },
  申請中: {
    撤回: '初始',
    送審: '審核中',
    退回: '初始',
    拒絕: '已拒絕',
  },
  審核中: {
    開票: '開票中',
    退回: '申請中',
    拒絕: '已拒絕',
  },
  開票中: {
    放款: '放款中',
    退回: '審核中',
  },
  放款中: {
    完成: '完成',
    退回: '開票中',
  },
  已拒絕: {
    重新申請: '初始',
  },
  完成: {},
};

// 歷程記錄型別
export interface PaymentLog {
  action: PaymentAction;
  user: string;
  timestamp: string; // ISO 格式
  note?: string;
}

export interface PaymentRecord {
  round: number; // 請款輪次
  status?: PaymentStatus; // 請款狀態
  percent: number; // 請款百分比
  amount: number; // 請款金額
  applicant: string; // 請款人
  date: string; // 請款日期
  note?: string; // 備註
  verifier?: string;          // 🔍 審核人
  financeApprover?: string;   // 🔍 放款審核人
  approvedAt?: string;        // 🔍 審核完成時間
  files?: string[];           // 🔍 附件（發票、申請單等）
  logs?: PaymentLog[];        // 🔍 歷程記錄
}

export interface ChangeRecord {
  type: '追加' | '追減'; // 變更類型
  amount: number; // 變更金額
  note?: string; // 備註
  date: string; // 變更日期
  user: string; // 變更操作人
}

export interface ContractMember {
  name: string;
  role: string;
}

export interface Contract {
  status: string; // 合約狀態
  code: string; // 合約編號
  orderNo: string; // 訂單編號
  orderDate: string; // 訂單日期
  projectNo: string; // 專案編號
  projectName: string; // 專案名稱
  contractAmount: number; // 合約金額
  pendingPercent: number; // 尚未請款百分比
  invoicedAmount: number; // 已開立金額
  paymentRound: number; // 請款輪次
  paymentPercent: number; // 請款百分比
  paymentStatus: string; // 請款狀態
  invoiceStatus: string; // 發票狀態
  note: string; // 備註
  url: string; // 檔案下載連結
  payments?: PaymentRecord[]; // 請款紀錄
  changes?: ChangeRecord[]; // 變更紀錄
  members?: ContractMember[]; // 合約成員
  tags?: string[]; // 合約標籤
  id?: string; // Firestore 文件 id
}

export interface Message {
  id?: string;
  contractId: string;
  user: string;
  message: string;
  createdAt: Date | any; // Firestore Timestamp or Date
}
