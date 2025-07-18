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
      return of(this.mockDataService.getMockLocationNodesByWorkspace(workspaceId));
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
   */
  getRootNodes(workspaceId: string): Observable<WorkspaceLocationNode[]> {
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
    const docRef = await addDoc(this.locationsCollection, node);
    return docRef.id;
  }

  /**
   * 更新位置節點
   */
  async updateLocationNode(id: string, updates: Partial<WorkspaceLocationNode>): Promise<void> {
    const nodeDoc = doc(this.firestore, 'workspace-locations', id);
    await updateDoc(nodeDoc, updates);
  }

  /**
   * 刪除位置節點
   */
  async deleteLocationNode(id: string): Promise<void> {
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