// 本檔案為權限常數與權限矩陣定義中心
// 功能：集中定義所有權限、角色預設、CRUD 權限映射、輔助查詢
// 用途：全域權限管理與檢查依據
// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
// 統一權限常數定義，遵循原子化設計原則

// ===== 原子化權限定義 =====
export const PERMISSIONS = {
  // 合約基本操作權限
  VIEW_CONTRACT: 'view_contract', //檢視合約
  CREATE_CONTRACT: 'create_contract', //新增合約
  EDIT_CONTRACT: 'edit_contract', //編輯合約
  DELETE_CONTRACT: 'delete_contract', //刪除合約
  
  // 請款發起權限
  CREATE_PAYMENT_REQUEST: 'create_payment_request', //新增請款申請
  SUBMIT_PAYMENT_REQUEST: 'submit_payment_request', //送出請款申請
  CANCEL_OWN_PAYMENT: 'cancel_own_payment', //撤回自己的請款申請
  
  // 請款審核權限
  REVIEW_PAYMENT: 'review_payment', //審核請款申請
  APPROVE_PAYMENT: 'approve_payment', //通過請款申請
  REJECT_PAYMENT: 'reject_payment', //拒絕請款申請
  
  // 財務操作權限
  ISSUE_INVOICE: 'issue_invoice', //開立發票
  PROCESS_PAYMENT: 'process_payment', //處理請款
  COMPLETE_PAYMENT: 'complete_payment', //完成請款
  
  // 系統管理權限
  MANAGE_ROLES: 'manage_roles', //管理角色
  VIEW_FINANCE: 'view_finance', //檢視財務
  
  // 通用操作權限
  COMMENT_CONTRACT: 'comment_contract', //留言
  UPLOAD_FILE: 'upload_file' //上傳檔案
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ===== 請款流程操作與權限原子化映射 =====
export const PAYMENT_ACTION_PERMISSIONS = {
  '送出': PERMISSIONS.SUBMIT_PAYMENT_REQUEST,    // 用戶提交請款申請（草稿→待審核）
  '撤回': PERMISSIONS.CANCEL_OWN_PAYMENT,       // 用戶撤回請款（待審核/待放款→草稿）
  '下一步': PERMISSIONS.REVIEW_PAYMENT,         // 推進到下一階段（待審核→待放款→放款中→完成）
  '拒絕': PERMISSIONS.REJECT_PAYMENT,           // 拒絕請款（任何狀態→拒絕）
  '重新申請': PERMISSIONS.SUBMIT_PAYMENT_REQUEST // 重新申請（拒絕→草稿）
} as const;

export type PaymentAction = keyof typeof PAYMENT_ACTION_PERMISSIONS;

// ===== 需要防止自己操作自己的操作 =====
export const SELF_APPROVAL_RESTRICTED_ACTIONS: PaymentAction[] = [
  '下一步', '拒絕'
];

// ===== 所有權限列表 =====
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// ===== 角色默認權限配置 =====
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.VIEW_CONTRACT, //檢視合約
    PERMISSIONS.CREATE_CONTRACT, //新增合約
    PERMISSIONS.EDIT_CONTRACT, //編輯合約
    PERMISSIONS.DELETE_CONTRACT, //刪除合約
    PERMISSIONS.MANAGE_ROLES, //管理角色
    PERMISSIONS.COMMENT_CONTRACT, //留言
    PERMISSIONS.UPLOAD_FILE //上傳檔案
  ],
  manager: [
    PERMISSIONS.VIEW_CONTRACT, //檢視合約
    PERMISSIONS.CREATE_CONTRACT, //新增合約
    PERMISSIONS.EDIT_CONTRACT, //編輯合約
    PERMISSIONS.REVIEW_PAYMENT, //審核請款申請
    PERMISSIONS.COMMENT_CONTRACT, //留言
    PERMISSIONS.UPLOAD_FILE //上傳檔案
  ],
  finance: [
    PERMISSIONS.VIEW_CONTRACT, //檢視合約
    PERMISSIONS.VIEW_FINANCE, //檢視財務
    PERMISSIONS.REVIEW_PAYMENT, //審核請款申請
    PERMISSIONS.APPROVE_PAYMENT, //通過請款申請
    PERMISSIONS.REJECT_PAYMENT, //拒絕請款申請
    PERMISSIONS.ISSUE_INVOICE, //開立發票
    PERMISSIONS.PROCESS_PAYMENT, //處理請款
    PERMISSIONS.COMPLETE_PAYMENT, //完成請款
    PERMISSIONS.COMMENT_CONTRACT //留言
  ],
  user: [
    PERMISSIONS.VIEW_CONTRACT, //檢視合約
    PERMISSIONS.CREATE_PAYMENT_REQUEST, //新增請款申請
    PERMISSIONS.SUBMIT_PAYMENT_REQUEST, //送出請款申請
    PERMISSIONS.CANCEL_OWN_PAYMENT, //撤回自己的請款申請
    PERMISSIONS.COMMENT_CONTRACT, //留言
    PERMISSIONS.UPLOAD_FILE //上傳檔案
  ],
  guest: [
    PERMISSIONS.VIEW_CONTRACT //檢視合約
  ]
} as const;

// ===== 路由權限映射配置 =====
export interface RoutePermissionConfig {
  path: string;
  requiredPermissions: Permission[];
  crudOperations?: {
    create?: Permission[];
    read?: Permission[];
    update?: Permission[];
    delete?: Permission[];
  };
  description?: string;
}

export const ROUTE_PERMISSION_MAPPING: RoutePermissionConfig[] = [
  {
    path: '/dashboard',
    requiredPermissions: [PERMISSIONS.VIEW_CONTRACT],
    description: '儀表板檢視'
  },
  {
    path: '/hub',
    requiredPermissions: [PERMISSIONS.VIEW_CONTRACT],
    crudOperations: {
      create: [PERMISSIONS.CREATE_CONTRACT],
      read: [PERMISSIONS.VIEW_CONTRACT],
      update: [PERMISSIONS.EDIT_CONTRACT],
      delete: [PERMISSIONS.DELETE_CONTRACT]
    },
    description: '合約管理中樞'
  },
  {
    path: '/roles',
    requiredPermissions: [PERMISSIONS.MANAGE_ROLES],
    crudOperations: {
      create: [PERMISSIONS.MANAGE_ROLES],
      read: [PERMISSIONS.MANAGE_ROLES],
      update: [PERMISSIONS.MANAGE_ROLES],
      delete: [PERMISSIONS.MANAGE_ROLES]
    },
    description: '角色權限管理'
  }
];

// ===== CRUD 操作監控配置 =====
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

export interface CrudPermissionCheck {
  operation: CrudOperation;
  resourceType: string;
  requiredPermissions: Permission[];
  allowSelfOperation?: boolean; // 是否允許操作自己的資源
}

export const CRUD_PERMISSION_MATRIX: Record<string, CrudPermissionCheck[]> = {
  contract: [
    {
      operation: 'create',
      resourceType: 'contract',
      requiredPermissions: [PERMISSIONS.CREATE_CONTRACT]
    },
    {
      operation: 'read',
      resourceType: 'contract',
      requiredPermissions: [PERMISSIONS.VIEW_CONTRACT]
    },
    {
      operation: 'update',
      resourceType: 'contract',
      requiredPermissions: [PERMISSIONS.EDIT_CONTRACT]
    },
    {
      operation: 'delete',
      resourceType: 'contract',
      requiredPermissions: [PERMISSIONS.DELETE_CONTRACT]
    }
  ],
  payment: [
    {
      operation: 'create',
      resourceType: 'payment',
      requiredPermissions: [PERMISSIONS.CREATE_PAYMENT_REQUEST],
      allowSelfOperation: true
    },
    {
      operation: 'read',
      resourceType: 'payment',
      requiredPermissions: [PERMISSIONS.VIEW_CONTRACT]
    },
    {
      operation: 'update',
      resourceType: 'payment',
      requiredPermissions: [PERMISSIONS.REVIEW_PAYMENT, PERMISSIONS.APPROVE_PAYMENT],
      allowSelfOperation: false // 不能審批自己的請款
    },
    {
      operation: 'delete',
      resourceType: 'payment',
      requiredPermissions: [PERMISSIONS.CANCEL_OWN_PAYMENT],
      allowSelfOperation: true
    }
  ],
  role: [
    {
      operation: 'create',
      resourceType: 'role',
      requiredPermissions: [PERMISSIONS.MANAGE_ROLES]
    },
    {
      operation: 'read',
      resourceType: 'role',
      requiredPermissions: [PERMISSIONS.MANAGE_ROLES]
    },
    {
      operation: 'update',
      resourceType: 'role',
      requiredPermissions: [PERMISSIONS.MANAGE_ROLES]
    },
    {
      operation: 'delete',
      resourceType: 'role',
      requiredPermissions: [PERMISSIONS.MANAGE_ROLES]
    }
  ]
};

// ===== 權限監控事件類型 =====
export interface PermissionCheckEvent {
  timestamp: Date;
  userId: string;
  operation: CrudOperation;
  resourceType: string;
  resourceId?: string;
  requiredPermissions: Permission[];
  userPermissions: Permission[];
  granted: boolean;
  route?: string;
  reason?: string;
}

// ===== 輔助函數：根據路由獲取權限配置 =====
export function getRoutePermissionConfig(path: string): RoutePermissionConfig | undefined {
  return ROUTE_PERMISSION_MAPPING.find(config => 
    path.startsWith(config.path) || config.path === path
  );
}

// ===== 輔助函數：根據資源類型和操作獲取權限要求 =====
export function getCrudPermissionRequirements(
  resourceType: string, 
  operation: CrudOperation
): CrudPermissionCheck | undefined {
  const resourceMatrix = CRUD_PERMISSION_MATRIX[resourceType];
  return resourceMatrix?.find(check => check.operation === operation);
} 