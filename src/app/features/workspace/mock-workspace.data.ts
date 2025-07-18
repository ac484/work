import { Workspace } from './models/workspace.model';

export const MOCK_WORKSPACES: Workspace[] = [
  // 1. 工地未開始，無成員、無任務、無日誌
  {
    id: 'empty-site',
    name: '新北空地',
    code: 'EMPTY-NTPC',
    status: '未開始',
    startDate: '2024-06-01',
    progress: 0,
    members: [],
    logs: [],
    tasks: [],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'root-empty', name: '空地', nodeType: 'root' },
      { id: 'leaf-empty1', name: '臨時倉庫', nodeType: 'leaf', parentId: 'root-empty' },
      { id: 'leaf-empty2', name: '臨時辦公室', nodeType: 'leaf', parentId: 'root-empty' }
    ],
    tags: [],
    description: '',
    createdAt: '2024-06-01T08:00:00Z'
  },
  // 2. 任務未指派，assignees 為空，status: '待處理'
  {
    id: 'umc',
    name: '聯電（UMC）台南園區',
    code: 'UMC-TNN',
    status: '進行中',
    startDate: '2023-02-01',
    progress: 10,
    members: [
      { userId: 'u3', name: '陳建志', role: '工地主任' }
    ],
    logs: [],
    tasks: [
      {
        id: 't2',
        workspaceId: 'umc',
        title: '基礎工程',
        status: '待處理',
        assignees: [],
        createdAt: '2023-02-01',
        progress: 0
      }
    ],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'root-umc', name: '主廠房', nodeType: 'root' },
      { id: 'branch-umc1', name: 'A棟', nodeType: 'branch', parentId: 'root-umc' },
      { id: 'branch-umc2', name: 'B棟', nodeType: 'branch', parentId: 'root-umc' },
      { id: 'leaf-umc1', name: 'A棟1F', nodeType: 'leaf', parentId: 'branch-umc1' },
      { id: 'leaf-umc2', name: 'A棟2F', nodeType: 'leaf', parentId: 'branch-umc1' },
      { id: 'leaf-umc3', name: 'B棟1F', nodeType: 'leaf', parentId: 'branch-umc2' },
      { id: 'leaf-umc4', name: 'B棟2F', nodeType: 'leaf', parentId: 'branch-umc2' },
      { id: 'leaf-umc5', name: '倉庫', nodeType: 'leaf', parentId: 'root-umc' },
      { id: 'leaf-umc6', name: '辦公室', nodeType: 'leaf', parentId: 'root-umc' }
    ],
    tags: ['半導體', '台南'],
    description: '聯電台南園區擴建工程',
    createdAt: '2023-02-01T08:00:00Z'
  },
  // 3. 任務有 assignees 但 logs 為空，progress 50
  {
    id: 'mediatek',
    name: '聯發科（MediaTek）竹科園區',
    code: 'MTK-HSINCHU',
    status: '進行中',
    startDate: '2023-05-01',
    progress: 50,
    members: [
      { userId: 'u5', name: '張偉', role: '工地主任' }
    ],
    logs: [],
    tasks: [
      {
        id: 't3',
        workspaceId: 'mediatek',
        title: '研發大樓基礎',
        status: '進行中',
        assignees: [
          { userId: 'u5', name: '張偉', role: '工地主任' }
        ],
        createdAt: '2023-05-01',
        progress: 50,
        note: undefined
      }
    ],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'root-mtk', name: '研發大樓', nodeType: 'root' },
      { id: 'branch-mtk1', name: '南棟', nodeType: 'branch', parentId: 'root-mtk' },
      { id: 'branch-mtk2', name: '北棟', nodeType: 'branch', parentId: 'root-mtk' },
      { id: 'leaf-mtk1', name: '南棟1F', nodeType: 'leaf', parentId: 'branch-mtk1' },
      { id: 'leaf-mtk2', name: '南棟2F', nodeType: 'leaf', parentId: 'branch-mtk1' },
      { id: 'leaf-mtk3', name: '北棟1F', nodeType: 'leaf', parentId: 'branch-mtk2' },
      { id: 'leaf-mtk4', name: '北棟2F', nodeType: 'leaf', parentId: 'branch-mtk2' }
    ],
    tags: ['IC設計', '竹科'],
    description: '聯發科竹科新建研發大樓',
    createdAt: '2023-04-01T08:00:00Z'
  },
  // 4. 任務有 logs 但 assignees 為空，progress 100
  {
    id: 'mxic',
    name: '旺宏電子（MXIC）新竹廠',
    code: 'MXIC-HSINCHU',
    status: '已完成',
    startDate: '2022-12-01',
    progress: 100,
    members: [
      { userId: 'u6', name: '林志明', role: '工地主任' }
    ],
    logs: [],
    tasks: [
      {
        id: 't4',
        workspaceId: 'mxic',
        title: '主體完工',
        status: '已完成',
        assignees: [],
        createdAt: '2022-12-01',
        progress: 100,
        logs: [
          {
            id: 'tl2',
            workspaceId: 'mxic',
            user: '林志明',
            action: '完工',
            content: '',
            timestamp: '2023-03-01T10:00:00Z',
            photos: [],
            note: undefined
          }
        ]
      }
    ],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'loc6', name: '主廠房', nodeType: 'root' }
    ],
    tags: ['記憶體', '新竹'],
    description: '旺宏新竹廠主體完工',
    createdAt: '2022-12-01T08:00:00Z'
  },
  // 5. 日曆事件 allDay true, end 無, description 空
  {
    id: 'auo',
    name: '友達光電（AUO）龍潭廠',
    code: 'AUO-LT',
    status: '進行中',
    startDate: '2023-03-01',
    progress: 30,
    members: [
      { userId: 'u8', name: '李國強', role: '工地主任' }
    ],
    logs: [],
    tasks: [],
    calendarEvents: [
      {
        id: 'c5',
        workspaceId: 'auo',
        title: '全日停電',
        description: '',
        start: '2023-05-01T00:00:00Z',
        allDay: true,
        createdBy: '李國強',
        createdAt: '2023-04-25T08:00:00Z'
      }
    ],
    safetyEvents: [],
    locations: [
      { id: 'root-auo', name: '面板廠', nodeType: 'root' },
      { id: 'branch-auo1', name: 'A棟', nodeType: 'branch', parentId: 'root-auo' },
      { id: 'branch-auo2', name: 'B棟', nodeType: 'branch', parentId: 'root-auo' },
      { id: 'leaf-auo1', name: 'A棟1F', nodeType: 'leaf', parentId: 'branch-auo1' },
      { id: 'leaf-auo2', name: 'A棟2F', nodeType: 'leaf', parentId: 'branch-auo1' },
      { id: 'leaf-auo3', name: 'B棟1F', nodeType: 'leaf', parentId: 'branch-auo2' },
      { id: 'leaf-auo4', name: 'B棟2F', nodeType: 'leaf', parentId: 'branch-auo2' },
      { id: 'leaf-auo5', name: '倉庫', nodeType: 'leaf', parentId: 'root-auo' }
    ],
    tags: ['面板', '龍潭'],
    description: '友達光電龍潭新建面板廠',
    createdAt: '2023-03-01T08:00:00Z'
  },
  // 6. 安全事件 resolved false, resolvedAt 無, note/照片有
  {
    id: 'ase',
    name: '日月光（ASE）高雄廠',
    code: 'ASE-KH',
    status: '進行中',
    startDate: '2023-01-15',
    progress: 40,
    members: [
      { userId: 'u9', name: '周志豪', role: '工地主任' }
    ],
    logs: [],
    tasks: [],
    calendarEvents: [],
    safetyEvents: [
      {
        id: 's6',
        workspaceId: 'ase',
        type: '事故',
        description: '工地小火災',
        reportedBy: '周志豪',
        reportedAt: '2023-03-01T09:00:00Z',
        resolved: false,
        note: '現場已通報消防',
        photos: ['https://example.com/fire.jpg']
      }
    ],
    locations: [
      { id: 'root-ase', name: '封裝廠', nodeType: 'root' },
      { id: 'branch-ase1', name: 'A區', nodeType: 'branch', parentId: 'root-ase' },
      { id: 'branch-ase2', name: 'B區', nodeType: 'branch', parentId: 'root-ase' },
      { id: 'leaf-ase1', name: 'A區1F', nodeType: 'leaf', parentId: 'branch-ase1' },
      { id: 'leaf-ase2', name: 'A區2F', nodeType: 'leaf', parentId: 'branch-ase1' },
      { id: 'leaf-ase3', name: 'B區1F', nodeType: 'leaf', parentId: 'branch-ase2' },
      { id: 'leaf-ase4', name: 'B區2F', nodeType: 'leaf', parentId: 'branch-ase2' }
    ],
    tags: ['封裝', '高雄'],
    description: '日月光高雄封裝廠新建工程',
    createdAt: '2023-01-15T08:00:00Z'
  },
  // 7. locations root+branch+leaf, code/note 空
  {
    id: 'innolux',
    name: '群創光電（Innolux）台中廠',
    code: 'INX-TC',
    status: '進行中',
    startDate: '2023-06-01',
    progress: 20,
    members: [
      { userId: 'u10', name: '吳怡君', role: '工地主任' }
    ],
    logs: [],
    tasks: [],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'root-innolux', name: '面板廠', nodeType: 'root' },
      { id: 'branch-innolux1', name: 'A棟', nodeType: 'branch', parentId: 'root-innolux' },
      { id: 'branch-innolux2', name: 'B棟', nodeType: 'branch', parentId: 'root-innolux' },
      { id: 'leaf-innolux1', name: 'A棟1F', nodeType: 'leaf', parentId: 'branch-innolux1' },
      { id: 'leaf-innolux2', name: 'A棟2F', nodeType: 'leaf', parentId: 'branch-innolux1' },
      { id: 'leaf-innolux3', name: 'B棟1F', nodeType: 'leaf', parentId: 'branch-innolux2' },
      { id: 'leaf-innolux4', name: 'B棟2F', nodeType: 'leaf', parentId: 'branch-innolux2' }
    ],
    tags: ['面板', '台中'],
    description: '群創光電台中新建面板廠',
    createdAt: '2023-05-01T08:00:00Z'
  },
  // 8. 任務有 dependencies, note/description/updatedAt 空
  {
    id: 'chimei',
    name: '奇美電子（Chimei）台南廠',
    code: 'CHIMEI-TNN',
    status: '進行中',
    startDate: '2023-02-15',
    progress: 20,
    members: [
      { userId: 'u11', name: '鄭文彬', role: '工地主任' }
    ],
    logs: [],
    tasks: [
      {
        id: 't8',
        workspaceId: 'chimei',
        title: '電子廠主體',
        status: '進行中',
        assignees: [
          { userId: 'u11', name: '鄭文彬', role: '工地主任' }
        ],
        createdAt: '2023-02-15',
        progress: 20,
        dependencies: ['t7'],
        note: undefined,
        description: undefined,
        updatedAt: undefined
      }
    ],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'root-chimei', name: '電子廠', nodeType: 'root' },
      { id: 'branch-chimei1', name: 'A區', nodeType: 'branch', parentId: 'root-chimei' },
      { id: 'branch-chimei2', name: 'B區', nodeType: 'branch', parentId: 'root-chimei' },
      { id: 'leaf-chimei1', name: 'A區1F', nodeType: 'leaf', parentId: 'branch-chimei1' },
      { id: 'leaf-chimei2', name: 'A區2F', nodeType: 'leaf', parentId: 'branch-chimei1' },
      { id: 'leaf-chimei3', name: 'B區1F', nodeType: 'leaf', parentId: 'branch-chimei2' },
      { id: 'leaf-chimei4', name: 'B區2F', nodeType: 'leaf', parentId: 'branch-chimei2' }
    ],
    tags: ['電子', '台南'],
    description: '奇美電子台南新建電子廠',
    createdAt: '2023-02-15T08:00:00Z'
  },
  // 9. 工地已終止，tags/description/updatedAt 空
  {
    id: 'pegatron',
    name: '和碩（Pegatron）桃園廠',
    code: 'PEGATRON-TY',
    status: '已終止',
    startDate: '2023-07-01',
    progress: 0,
    members: [
      { userId: 'u12', name: '林信宏', role: '工地主任' }
    ],
    logs: [],
    tasks: [],
    calendarEvents: [],
    safetyEvents: [],
    locations: [
      { id: 'root-pegatron', name: '組裝廠', nodeType: 'root' },
      { id: 'branch-pegatron1', name: 'A區', nodeType: 'branch', parentId: 'root-pegatron' },
      { id: 'branch-pegatron2', name: 'B區', nodeType: 'branch', parentId: 'root-pegatron' },
      { id: 'leaf-pegatron1', name: 'A區1F', nodeType: 'leaf', parentId: 'branch-pegatron1' },
      { id: 'leaf-pegatron2', name: 'A區2F', nodeType: 'leaf', parentId: 'branch-pegatron1' },
      { id: 'leaf-pegatron3', name: 'B區1F', nodeType: 'leaf', parentId: 'branch-pegatron2' },
      { id: 'leaf-pegatron4', name: 'B區2F', nodeType: 'leaf', parentId: 'branch-pegatron2' }
    ],
    tags: undefined,
    description: undefined,
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: undefined
  },
  // 10. 工地進行中，members 多人，任務 assignees 多人，日誌有照片
  {
    id: 'tsmc',
    name: '台積電（TSMC）新竹園區',
    code: 'TSMC-HSINCHU',
    status: '進行中',
    startDate: '2023-01-01',
    progress: 65,
    members: [
      { userId: 'u1', name: '王大明', role: '工地主任' },
      { userId: 'u2', name: '李小華', role: '安全員' },
      { userId: 'u16', name: '張三', role: '工人' }
    ],
    logs: [
      {
        id: 'l1',
        workspaceId: 'tsmc',
        user: '王大明',
        action: '開工',
        content: '工地正式開工',
        timestamp: '2023-01-01T08:00:00Z',
        photos: ['https://example.com/photo1.jpg'],
        note: '天氣晴朗'
      }
    ],
    tasks: [
      {
        id: 't1',
        workspaceId: 'tsmc',
        title: '主體結構施工',
        description: '進行主體結構澆置',
        status: '進行中',
        assignees: [
          { userId: 'u1', name: '王大明', role: '工地主任' },
          { userId: 'u16', name: '張三', role: '工人' }
        ],
        locationId: 'loc1',
        startDate: '2023-01-05',
        endDate: '2023-06-30',
        actualStart: '2023-01-06',
        actualEnd: undefined,
        progress: 60,
        dependencies: [],
        logs: [],
        photos: ['https://example.com/photo2.jpg'],
        note: '需注意天氣',
        createdAt: '2023-01-01T08:00:00Z',
        updatedAt: '2023-04-01T10:00:00Z'
      }
    ],
    calendarEvents: [
      {
        id: 'c1',
        workspaceId: 'tsmc',
        title: '工地會議',
        description: '每月例行會議',
        start: '2023-04-01T14:00:00Z',
        end: '2023-04-01T15:00:00Z',
        allDay: false,
        createdBy: '王大明',
        createdAt: '2023-03-25T08:00:00Z'
      }
    ],
    safetyEvents: [
      {
        id: 's1',
        workspaceId: 'tsmc',
        type: '巡檢',
        description: '日常安全巡檢',
        reportedBy: '李小華',
        reportedAt: '2023-02-01T09:00:00Z',
        resolved: true,
        resolvedAt: '2023-02-01T10:00:00Z',
        note: '無異常',
        photos: []
      }
    ],
    locations: [
      { id: 'root-tsmc', name: '主廠房', nodeType: 'root', code: 'A1', note: '主要生產區' },
      { id: 'branch-tsmc1', name: '倉庫', nodeType: 'leaf', parentId: 'root-tsmc', code: 'A2', note: '' }
    ],
    tags: ['半導體', '新竹'],
    description: '台積電新竹園區新建工程',
    createdAt: '2023-01-01T08:00:00Z',
    updatedAt: '2023-04-01T10:00:00Z'
  }
];
