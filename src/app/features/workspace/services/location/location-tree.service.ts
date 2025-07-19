import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, combineLatest, of } from 'rxjs';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { WorkspaceLocationNode } from '../../models';
import { MockDataService } from '../mock/mock-data.service';

/**
 * 工作區空間結構樹狀服務
 * 負責管理工地的空間層級結構（root/branch/leaf）
 */
@Injectable({ providedIn: 'root' })
export class LocationTreeService {
  private firestore = inject(Firestore);
  private mockDataService = inject(MockDataService);
  private locationsCollection = collection(this.firestore, 'workspace-locations');
  
  private selectedNodeId$ = new BehaviorSubject<string | null>(null);
  
  // 開發模式切換（生產環境請設為 false）
  private readonly isDevelopmentMode = true;

  /**
   * 獲取指定工作區的所有位置節點
   */
  getLocationsByWorkspace(workspaceId: string): Observable<WorkspaceLocationNode[]> {
    if (this.isDevelopmentMode) {
      const locations = this.mockDataService.getMockLocationNodesByWorkspace(workspaceId);
      return this.mockDataService.simulateCollectionQuery(locations);
    }
    const q = query(
      this.locationsCollection, 
      where('workspaceId', '==', workspaceId),
      orderBy('name')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceLocationNode[]>;
  }

  /**
   * 獲取樹狀結構的根節點
   * 每個工地只能有一個根節點
   */
  getRootNodes(workspaceId: string): Observable<WorkspaceLocationNode[]> {
    if (this.isDevelopmentMode) {
      const locations = this.mockDataService.getMockLocationNodesByWorkspace(workspaceId);
      const rootNodes = locations.filter(node => node.nodeType === 'root');
      return this.mockDataService.simulateCollectionQuery(rootNodes);
    }
    const q = query(
      this.locationsCollection,
      where('workspaceId', '==', workspaceId),
      where('nodeType', '==', 'root'),
      orderBy('name')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceLocationNode[]>;
  }

  /**
   * 獲取指定父節點的子節點
   */
  getChildNodes(parentId: string): Observable<WorkspaceLocationNode[]> {
    if (this.isDevelopmentMode) {
      // 從所有工作區中找出對應的子節點
      const allLocations: WorkspaceLocationNode[] = [];
      this.mockDataService.getMockWorkspaces().forEach(workspace => {
        if (workspace.locations) {
          allLocations.push(...workspace.locations);
        }
      });
      const childNodes = allLocations.filter(node => node.parentId === parentId);
      return this.mockDataService.simulateCollectionQuery(childNodes);
    }
    const q = query(
      this.locationsCollection,
      where('parentId', '==', parentId),
      orderBy('name')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceLocationNode[]>;
  }

  /**
   * 獲取葉節點（任務容器）
   */
  getLeafNodes(workspaceId: string): Observable<WorkspaceLocationNode[]> {
    if (this.isDevelopmentMode) {
      const locations = this.mockDataService.getMockLocationNodesByWorkspace(workspaceId);
      const leafNodes = locations.filter(node => node.nodeType === 'leaf');
      return this.mockDataService.simulateCollectionQuery(leafNodes);
    }
    const q = query(
      this.locationsCollection,
      where('workspaceId', '==', workspaceId),
      where('nodeType', '==', 'leaf'),
      orderBy('name')
    );
    return collectionData(q, { idField: 'id' }) as Observable<WorkspaceLocationNode[]>;
  }

  /**
   * 創建新的位置節點
   */
  async createLocationNode(node: Omit<WorkspaceLocationNode, 'id'>): Promise<string> {
    if (this.isDevelopmentMode) {
      // 模擬新增到對應工作區的位置列表
      const workspace = this.mockDataService.getMockWorkspaces().find(w => w.id === node.workspaceId);
      if (workspace && workspace.locations) {
        const newId = `workspace-${node.workspaceId}-loc-${workspace.locations.length + 1}`;
        const newNode = { ...node, id: newId } as WorkspaceLocationNode;
        workspace.locations.push(newNode);
        return newId;
      }
      return '';
    }
    const docRef = await addDoc(this.locationsCollection, node);
    return docRef.id;
  }

  /**
   * 更新位置節點
   */
  async updateLocationNode(id: string, updates: Partial<WorkspaceLocationNode>): Promise<void> {
    if (this.isDevelopmentMode) {
      // 模擬更新對應工作區的位置節點
      const allWorkspaces = this.mockDataService.getMockWorkspaces();
      for (const workspace of allWorkspaces) {
        if (workspace.locations) {
          const locationIndex = workspace.locations.findIndex(loc => loc.id === id);
          if (locationIndex !== -1) {
            workspace.locations[locationIndex] = { ...workspace.locations[locationIndex], ...updates };
            break;
          }
        }
      }
      return;
    }
    const nodeDoc = doc(this.firestore, 'workspace-locations', id);
    await updateDoc(nodeDoc, updates);
  }

  /**
   * 刪除位置節點
   */
  async deleteLocationNode(id: string): Promise<void> {
    if (this.isDevelopmentMode) {
      // 模擬刪除對應工作區的位置節點
      const allWorkspaces = this.mockDataService.getMockWorkspaces();
      for (const workspace of allWorkspaces) {
        if (workspace.locations) {
          const locationIndex = workspace.locations.findIndex(loc => loc.id === id);
          if (locationIndex !== -1) {
            workspace.locations.splice(locationIndex, 1);
            break;
          }
        }
      }
      return;
    }
    const nodeDoc = doc(this.firestore, 'workspace-locations', id);
    await deleteDoc(nodeDoc);
  }

  /**
   * 構建完整的樹狀結構
   */
  buildLocationTree(workspaceId: string): Observable<WorkspaceLocationNode[]> {
    return this.getLocationsByWorkspace(workspaceId).pipe(
      map(nodes => this.buildTreeStructure(nodes))
    );
  }

  /**
   * 設置當前選中的節點
   */
  setSelectedNode(nodeId: string | null): void {
    this.selectedNodeId$.next(nodeId);
  }

  /**
   * 獲取當前選中的節點 ID
   */
  getSelectedNodeId(): Observable<string | null> {
    return this.selectedNodeId$.asObservable();
  }

  /**
   * 私有方法：構建樹狀結構
   */
  private buildTreeStructure(nodes: WorkspaceLocationNode[]): WorkspaceLocationNode[] {
    const nodeMap = new Map<string, WorkspaceLocationNode & { children?: WorkspaceLocationNode[] }>();
    const rootNodes: (WorkspaceLocationNode & { children?: WorkspaceLocationNode[] })[] = [];

    // 建立節點映射
    nodes.forEach(node => {
      nodeMap.set(node.id!, { ...node, children: [] });
    });

    // 建立父子關係
    nodes.forEach(node => {
      const currentNode = nodeMap.get(node.id!);
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parentNode = nodeMap.get(node.parentId);
        parentNode?.children?.push(currentNode!);
      } else {
        rootNodes.push(currentNode!);
      }
    });

    return rootNodes;
  }
}