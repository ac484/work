import { Workspace } from './models/workspace.model';

export const MOCK_WORKSPACES: Workspace[] = [
  // 台北科技園區 - 完整的工地範例
  {
    id: 'workspace-1',
    name: '台北科技園區',
    code: 'TPE-TECH',
    status: '進行中',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progress: 35,
    members: [
      { userId: 'u1', name: '張工程師', role: '專案經理' },
      { userId: 'u2', name: '李主任', role: '工地主任' },
      { userId: 'u3', name: '王技師', role: '結構技師' },
      { userId: 'u4', name: '陳監工', role: '品質監工' },
      { userId: 'u5', name: '林安全員', role: '安全管理員' }
    ],
    logs: [
      {
        id: 'l1',
        workspaceId: 'workspace-1',
        user: '張工程師',
        action: '開工',
        content: '工地正式開工',
        timestamp: '2024-01-01T08:00:00Z',
        photos: ['https://example.com/photo1.jpg'],
        note: '天氣晴朗'
      }
    ],
    tasks: [
      {
        id: 't1',
        workspaceId: 'workspace-1',
        title: '地基開挖作業',
        description: '進行建築物地基開挖，深度約15公尺',
        status: '已完成',
        assignees: [
          { name: '張工程師', role: '專案經理' },
          { name: '李主任', role: '工地主任' }
        ],
        locationId: 'workspace-1-loc-8',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        actualStart: '2024-01-15',
        actualEnd: '2024-02-10',
        progress: 100,
        hours: 320,
        createdAt: '2024-01-10T09:00:00.000Z',
        updatedAt: '2024-02-10T17:30:00.000Z'
      },
      {
        id: 't2',
        workspaceId: 'workspace-1',
        title: '鋼筋綁紮工程',
        description: '進行主結構鋼筋綁紮作業',
        status: '進行中',
        assignees: [
          { name: '王技師', role: '結構技師' },
          { name: '陳監工', role: '品質監工' }
        ],
        locationId: 'workspace-1-loc-9',
        startDate: '2024-02-16',
        endDate: '2024-03-30',
        actualStart: '2024-02-16',
        progress: 75,
        hours: 480,
        createdAt: '2024-02-10T10:00:00.000Z',
        updatedAt: '2024-03-15T16:45:00.000Z'
      },
      {
        id: 't3',
        workspaceId: 'workspace-1',
        title: '混凝土澆置',
        description: '進行結構體混凝土澆置作業',
        status: '待處理',
        assignees: [
          { name: '李主任', role: '工地主任' },
          { name: '林安全員', role: '安全管理員' }
        ],
        locationId: 'workspace-1-loc-10',
        startDate: '2024-04-01',
        endDate: '2024-05-15',
        progress: 0,
        hours: 360,
        dependencies: ['t2'],
        createdAt: '2024-03-01T11:00:00.000Z'
      }
    ],
    calendarEvents: [
      {
        id: 'c1',
        workspaceId: 'workspace-1',
        title: '工地會議',
        description: '每月例行會議',
        start: '2024-04-01T14:00:00Z',
        end: '2024-04-01T15:00:00Z',
        allDay: false,
        createdBy: '張工程師',
        createdAt: '2024-03-25T08:00:00Z'
      }
    ],
    safetyEvents: [
      {
        id: 's1',
        workspaceId: 'workspace-1',
        type: '巡檢',
        description: '日常安全巡檢',
        reportedBy: '林安全員',
        reportedAt: '2024-02-01T09:00:00Z',
        resolved: true,
        resolvedAt: '2024-02-01T10:00:00Z',
        note: '無異常',
        photos: []
      }
    ],
    locations: [
      { id: 'workspace-1-loc-1', workspaceId: 'workspace-1', name: '工地主體', nodeType: 'root', code: 'MAIN', note: '主要工地範圍' },
      { id: 'workspace-1-loc-2', workspaceId: 'workspace-1', name: 'A棟區域', nodeType: 'branch', parentId: 'workspace-1-loc-1', code: 'A', note: '主要建築物區域' },
      { id: 'workspace-1-loc-3', workspaceId: 'workspace-1', name: 'B棟區域', nodeType: 'branch', parentId: 'workspace-1-loc-1', code: 'B', note: '附屬建築物區域' },
      { id: 'workspace-1-loc-4', workspaceId: 'workspace-1', name: '公共設施', nodeType: 'branch', parentId: 'workspace-1-loc-1', code: 'PUBLIC', note: '公共設施區域' },
      { id: 'workspace-1-loc-5', workspaceId: 'workspace-1', name: '地下室', nodeType: 'branch', parentId: 'workspace-1-loc-2', code: 'A-B', note: '停車場及機房' },
      { id: 'workspace-1-loc-6', workspaceId: 'workspace-1', name: '辦公樓層', nodeType: 'branch', parentId: 'workspace-1-loc-2', code: 'A-L', note: '辦公樓層' },
      { id: 'workspace-1-loc-7', workspaceId: 'workspace-1', name: '頂樓設備', nodeType: 'branch', parentId: 'workspace-1-loc-2', code: 'A-R', note: '機房及設備' },
      { id: 'workspace-1-loc-8', workspaceId: 'workspace-1', name: 'B1停車場', nodeType: 'leaf', parentId: 'workspace-1-loc-5', code: 'A-B1-P' },
      { id: 'workspace-1-loc-9', workspaceId: 'workspace-1', name: 'B2機房', nodeType: 'leaf', parentId: 'workspace-1-loc-5', code: 'A-B2-M' },
      { id: 'workspace-1-loc-10', workspaceId: 'workspace-1', name: 'B3儲藏室', nodeType: 'leaf', parentId: 'workspace-1-loc-5', code: 'A-B3-S' },
      { id: 'workspace-1-loc-11', workspaceId: 'workspace-1', name: '1樓大廳', nodeType: 'leaf', parentId: 'workspace-1-loc-6', code: 'A-1F-L' },
      { id: 'workspace-1-loc-12', workspaceId: 'workspace-1', name: '2-5樓辦公室', nodeType: 'leaf', parentId: 'workspace-1-loc-6', code: 'A-2-5F-O' },
      { id: 'workspace-1-loc-13', workspaceId: 'workspace-1', name: '6-10樓辦公室', nodeType: 'leaf', parentId: 'workspace-1-loc-6', code: 'A-6-10F-O' },
      { id: 'workspace-1-loc-14', workspaceId: 'workspace-1', name: '空調機房', nodeType: 'leaf', parentId: 'workspace-1-loc-7', code: 'A-R-HVAC' },
      { id: 'workspace-1-loc-15', workspaceId: 'workspace-1', name: '電梯機房', nodeType: 'leaf', parentId: 'workspace-1-loc-7', code: 'A-R-ELEV' },
      { id: 'workspace-1-loc-16', workspaceId: 'workspace-1', name: '會議中心', nodeType: 'branch', parentId: 'workspace-1-loc-3', code: 'B-C', note: '會議及活動空間' },
      { id: 'workspace-1-loc-17', workspaceId: 'workspace-1', name: '大會議室', nodeType: 'leaf', parentId: 'workspace-1-loc-16', code: 'B-C-L' },
      { id: 'workspace-1-loc-18', workspaceId: 'workspace-1', name: '小會議室', nodeType: 'leaf', parentId: 'workspace-1-loc-16', code: 'B-C-S' },
      { id: 'workspace-1-loc-19', workspaceId: 'workspace-1', name: '多功能廳', nodeType: 'leaf', parentId: 'workspace-1-loc-16', code: 'B-C-M' },
      { id: 'workspace-1-loc-20', workspaceId: 'workspace-1', name: '警衛室', nodeType: 'leaf', parentId: 'workspace-1-loc-4', code: 'PUBLIC-SEC' },
      { id: 'workspace-1-loc-21', workspaceId: 'workspace-1', name: '停車場', nodeType: 'leaf', parentId: 'workspace-1-loc-4', code: 'PUBLIC-PARK' },
      { id: 'workspace-1-loc-22', workspaceId: 'workspace-1', name: '垃圾處理區', nodeType: 'leaf', parentId: 'workspace-1-loc-4', code: 'PUBLIC-WASTE' }
    ],
    tags: ['科技園區', '辦公大樓'],
    description: '台北科技園區新建辦公大樓專案',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-03-15T14:20:00Z'
  }
];
