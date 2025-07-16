import { Injectable } from '@angular/core';
import { Workspace, WorkspaceLocationNode, WorkspaceTask, WorkspaceMember } from '../../models';

/**
 * 模擬資料服務
 * 提供開發階段的測試資料
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {

  /**
   * 獲取模擬工作區資料
   */
  getMockWorkspaces(): Workspace[] {
    return [
      {
        id: 'workspace-1',
        name: '台北101大樓建設專案',
        code: 'TP101',
        status: '進行中',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        progress: 65,
        members: this.getMockMembers(),
        logs: [],
        tasks: [],
        calendarEvents: [],
        safetyEvents: [],
        tags: ['高樓建築', '商業大樓'],
        description: '台北101大樓建設專案，包含地基工程、結構工程、裝修工程等多個階段',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        locations: this.getMockLocationNodes('workspace-1')
      },
      {
        id: 'workspace-2',
        name: '高雄港區開發案',
        code: 'KH-PORT',
        status: '進行中',
        startDate: '2024-03-01',
        endDate: '2026-02-28',
        progress: 35,
        members: this.getMockMembers(),
        logs: [],
        tasks: [],
        calendarEvents: [],
        safetyEvents: [],
        tags: ['港區開發', '基礎建設'],
        description: '高雄港區綜合開發專案，包含碼頭建設、倉儲設施、交通配套等',
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: '2024-03-15T14:20:00.000Z',
        locations: this.getMockLocationNodes('workspace-2')
      },
      {
        id: 'workspace-3',
        name: '桃園機場第三航廈',
        code: 'TPE-T3',
        status: '未開始',
        startDate: '2024-06-01',
        endDate: '2027-05-31',
        progress: 0,
        members: this.getMockMembers(),
        logs: [],
        tasks: [],
        calendarEvents: [],
        safetyEvents: [],
        tags: ['機場建設', '航廈工程'],
        description: '桃園國際機場第三航廈建設專案',
        createdAt: '2024-05-01T00:00:00.000Z',
        locations: this.getMockLocationNodes('workspace-3')
      }
    ];
  }

  /**
   * 獲取模擬成員資料
   */
  private getMockMembers(): WorkspaceMember[] {
    return [
      { userId: 'user-1', name: '張工程師', role: '專案經理' },
      { userId: 'user-2', name: '李主任', role: '工地主任' },
      { userId: 'user-3', name: '王技師', role: '結構技師' },
      { userId: 'user-4', name: '陳監工', role: '品質監工' },
      { userId: 'user-5', name: '林安全員', role: '安全管理員' }
    ];
  }

  /**
   * 獲取模擬位置節點資料
   */
  private getMockLocationNodes(workspaceId: string): WorkspaceLocationNode[] {
    const baseNodes: Omit<WorkspaceLocationNode, 'id' | 'workspaceId'>[] = [
      // 根節點
      { name: 'A棟', nodeType: 'root', code: 'A', note: '主要建築物' },
      { name: 'B棟', nodeType: 'root', code: 'B', note: '附屬建築物' },
      
      // A棟的枝節點
      { name: '地下室', nodeType: 'branch', parentId: 'A', code: 'A-B', note: '停車場及機房' },
      { name: '1-10樓', nodeType: 'branch', parentId: 'A', code: 'A-L', note: '辦公樓層' },
      { name: '頂樓', nodeType: 'branch', parentId: 'A', code: 'A-R', note: '機房及設備' },
      
      // 地下室的葉節點
      { name: 'B1停車場', nodeType: 'leaf', parentId: 'A-B', code: 'A-B1-P' },
      { name: 'B2機房', nodeType: 'leaf', parentId: 'A-B', code: 'A-B2-M' },
      { name: 'B3儲藏室', nodeType: 'leaf', parentId: 'A-B', code: 'A-B3-S' },
      
      // 1-10樓的葉節點
      { name: '1樓大廳', nodeType: 'leaf', parentId: 'A-L', code: 'A-1F-L' },
      { name: '2-5樓辦公室', nodeType: 'leaf', parentId: 'A-L', code: 'A-2-5F-O' },
      { name: '6-10樓辦公室', nodeType: 'leaf', parentId: 'A-L', code: 'A-6-10F-O' },
      
      // B棟的枝節點和葉節點
      { name: '會議中心', nodeType: 'branch', parentId: 'B', code: 'B-C', note: '會議及活動空間' },
      { name: '大會議室', nodeType: 'leaf', parentId: 'B-C', code: 'B-C-L' },
      { name: '小會議室', nodeType: 'leaf', parentId: 'B-C', code: 'B-C-S' },
      { name: '多功能廳', nodeType: 'leaf', parentId: 'B-C', code: 'B-C-M' }
    ];

    return baseNodes.map((node, index) => ({
      id: `${workspaceId}-loc-${index + 1}`,
      workspaceId,
      ...node,
      // 處理 parentId 的映射
      parentId: node.parentId ? `${workspaceId}-loc-${this.getParentIndex(node.parentId, baseNodes) + 1}` : undefined
    }));
  }

  /**
   * 獲取父節點索引（用於 ID 映射）
   */
  private getParentIndex(parentCode: string, nodes: any[]): number {
    return nodes.findIndex(node => node.code === parentCode);
  }

  /**
   * 獲取模擬任務資料
   */
  getMockTasks(workspaceId: string, locationId?: string): WorkspaceTask[] {
    const baseTasks: Omit<WorkspaceTask, 'id' | 'workspaceId' | 'locationId'>[] = [
      {
        title: '地基開挖作業',
        description: '進行建築物地基開挖，深度約15公尺',
        status: '已完成',
        assignees: [
          { name: '張工程師', role: '專案經理' },
          { name: '李主任', role: '工地主任' }
        ],
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
        title: '鋼筋綁紮工程',
        description: '進行主結構鋼筋綁紮作業',
        status: '進行中',
        assignees: [
          { name: '王技師', role: '結構技師' },
          { name: '陳監工', role: '品質監工' }
        ],
        startDate: '2024-02-16',
        endDate: '2024-03-30',
        actualStart: '2024-02-16',
        progress: 75,
        hours: 480,
        createdAt: '2024-02-10T10:00:00.000Z',
        updatedAt: '2024-03-15T16:45:00.000Z'
      },
      {
        title: '混凝土澆置',
        description: '進行結構體混凝土澆置作業',
        status: '待處理',
        assignees: [
          { name: '李主任', role: '工地主任' },
          { name: '林安全員', role: '安全管理員' }
        ],
        startDate: '2024-04-01',
        endDate: '2024-05-15',
        progress: 0,
        hours: 360,
        dependencies: ['task-2'], // 依賴鋼筋綁紮工程
        createdAt: '2024-03-01T11:00:00.000Z'
      },
      {
        title: '外牆施工',
        description: '進行建築物外牆施工作業',
        status: '待處理',
        assignees: [
          { name: '張工程師', role: '專案經理' }
        ],
        startDate: '2024-05-16',
        endDate: '2024-07-31',
        progress: 0,
        hours: 600,
        dependencies: ['task-3'], // 依賴混凝土澆置
        createdAt: '2024-03-01T11:30:00.000Z'
      },
      {
        title: '機電設備安裝',
        description: '進行空調、電力、給排水系統安裝',
        status: '待處理',
        assignees: [
          { name: '王技師', role: '結構技師' },
          { name: '陳監工', role: '品質監工' }
        ],
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        progress: 0,
        hours: 720,
        createdAt: '2024-03-01T12:00:00.000Z'
      }
    ];

    return baseTasks.map((task, index) => ({
      id: `task-${index + 1}`,
      workspaceId,
      locationId,
      ...task
    }));
  }

  /**
   * 根據工作區 ID 獲取對應的位置節點
   */
  getMockLocationNodesByWorkspace(workspaceId: string): WorkspaceLocationNode[] {
    const workspace = this.getMockWorkspaces().find(w => w.id === workspaceId);
    return workspace?.locations || [];
  }

  /**
   * 根據位置 ID 獲取對應的任務
   */
  getMockTasksByLocation(locationId: string): WorkspaceTask[] {
    // 簡化實作：返回一些示例任務
    const workspaceId = locationId.split('-loc-')[0];
    return this.getMockTasks(workspaceId, locationId).slice(0, 3);
  }
}