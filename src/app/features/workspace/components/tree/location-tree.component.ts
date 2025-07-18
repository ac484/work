import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { WorkspaceFacadeService } from '../../services/core/workspace-facade.service';
import { WorkspaceLocationNode } from '../../models';

/**
 * 工作區位置樹狀結構元件
 * 顯示工地的空間層級結構，支援展開/收合、選擇節點等操作
 */
@Component({
  selector: 'app-location-tree',
  standalone: true,
  imports: [
    CommonModule,
    TreeModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    FormsModule
  ],
  template: `
    <div class="location-tree-container">
      <div class="tree-header">
        <h3>工地結構</h3>
        <p-button 
          icon="pi pi-plus" 
          label="新增節點" 
          size="small"
          (onClick)="showAddNodeDialog = true">
        </p-button>
      </div>

      <p-tree 
        [value]="treeNodes()"
        selectionMode="single"
        [(selection)]="selectedNode"
        (onNodeSelect)="onNodeSelect($event)"
        [loading]="loading()"
        styleClass="w-full">
        
        <ng-template pTemplate="default" let-node>
          <div class="tree-node-content">
            <i [class]="getNodeIcon(node.data?.nodeType)" class="mr-2"></i>
            <span class="node-name">{{ node.label }}</span>
            <span class="node-type-badge" [class]="'badge-' + node.data?.nodeType">
              {{ getNodeTypeLabel(node.data?.nodeType) }}
            </span>
            @if (node.data?.code) {
              <span class="node-code">({{ node.data.code }})</span>
            }
          </div>
        </ng-template>
      </p-tree>

      @if (treeNodes().length === 0 && !loading()) {
        <div class="empty-state">
          <i class="pi pi-sitemap text-4xl text-gray-400"></i>
          <p class="text-gray-500 mt-2">尚未建立工地結構</p>
          <p-button 
            label="建立第一個根節點" 
            icon="pi pi-plus"
            (onClick)="showAddNodeDialog = true">
          </p-button>
        </div>
      }
    </div>

    <!-- 新增節點對話框 -->
    <p-dialog 
      header="新增位置節點" 
      [(visible)]="showAddNodeDialog"
      [modal]="true"
      [style]="{width: '450px'}"
      [closable]="true">
      
      <div class="dialog-content">
        <div class="field">
          <label for="nodeName">節點名稱 *</label>
          <input 
            pInputText 
            id="nodeName"
            [(ngModel)]="newNode.name"
            placeholder="請輸入節點名稱"
            class="w-full">
        </div>

        <div class="field">
          <label for="nodeType">節點類型 *</label>
          <p-select 
            id="nodeType"
            [(ngModel)]="newNode.nodeType"
            [options]="nodeTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="選擇節點類型"
            class="w-full">
          </p-select>
        </div>

        <div class="field">
          <label for="nodeCode">節點編號</label>
          <input 
            pInputText 
            id="nodeCode"
            [(ngModel)]="newNode.code"
            placeholder="請輸入節點編號（選填）"
            class="w-full">
        </div>

        <div class="field">
          <label for="nodeNote">備註</label>
          <input 
            pInputText 
            id="nodeNote"
            [(ngModel)]="newNode.note"
            placeholder="請輸入備註（選填）"
            class="w-full">
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button 
          label="取消" 
          icon="pi pi-times" 
          [text]="true"
          (onClick)="cancelAddNode()">
        </p-button>
        <p-button 
          label="確認" 
          icon="pi pi-check"
          (onClick)="confirmAddNode()"
          [disabled]="!newNode.name || !newNode.nodeType">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .location-tree-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .tree-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .tree-header h3 {
      margin: 0;
      color: var(--text-color);
    }

    .tree-node-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .node-name {
      font-weight: 500;
      flex: 1;
    }

    .node-type-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
    }

    .badge-root {
      background-color: var(--blue-100);
      color: var(--blue-800);
    }

    .badge-branch {
      background-color: var(--green-100);
      color: var(--green-800);
    }

    .badge-leaf {
      background-color: var(--orange-100);
      color: var(--orange-800);
    }

    .node-code {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .dialog-content .field {
      margin-bottom: 1rem;
    }

    .dialog-content label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class LocationTreeComponent implements OnInit {
  private workspaceFacade = inject(WorkspaceFacadeService);

  // 狀態管理
  treeNodes = signal<TreeNode[]>([]);
  loading = signal(false);
  selectedNode: TreeNode | null = null;
  showAddNodeDialog = false;

  // 新增節點表單
  newNode = {
    name: '',
    nodeType: '' as 'root' | 'branch' | 'leaf' | '',
    code: '',
    note: ''
  };

  nodeTypeOptions = [
    { label: '根節點 (Root)', value: 'root' },
    { label: '枝節點 (Branch)', value: 'branch' },
    { label: '葉節點 (Leaf)', value: 'leaf' }
  ];

  ngOnInit() {
    this.loadLocationTree();
  }

  /**
   * 載入位置樹狀結構
   */
  private loadLocationTree() {
    this.loading.set(true);
    
    this.workspaceFacade.getCurrentWorkspaceLocationTree().subscribe({
      next: (locations) => {
        this.treeNodes.set(this.convertToTreeNodes(locations));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('載入位置樹狀結構失敗:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * 將位置節點轉換為 PrimeNG TreeNode 格式
   */
  private convertToTreeNodes(locations: WorkspaceLocationNode[]): TreeNode[] {
    return locations.map(location => ({
      key: location.id,
      label: location.name,
      data: location,
      icon: this.getNodeIcon(location.nodeType),
      children: (location as any).children ? 
        this.convertToTreeNodes((location as any).children) : undefined,
      leaf: location.nodeType === 'leaf'
    }));
  }

  /**
   * 獲取節點圖示
   */
  getNodeIcon(nodeType: string): string {
    switch (nodeType) {
      case 'root': return 'pi pi-home';
      case 'branch': return 'pi pi-sitemap';
      case 'leaf': return 'pi pi-folder';
      default: return 'pi pi-circle';
    }
  }

  /**
   * 獲取節點類型標籤
   */
  getNodeTypeLabel(nodeType: string): string {
    switch (nodeType) {
      case 'root': return '根';
      case 'branch': return '枝';
      case 'leaf': return '葉';
      default: return '';
    }
  }

  /**
   * 節點選擇事件
   */
  onNodeSelect(event: any) {
    const locationId = event.node?.key;
    if (locationId) {
      this.workspaceFacade.setSelectedLocation(locationId);
    }
  }

  /**
   * 確認新增節點
   */
  async confirmAddNode() {
    if (!this.newNode.name || !this.newNode.nodeType) {
      return;
    }

    try {
      const workspaceId = await this.workspaceFacade.getSelectedWorkspaceId().pipe().toPromise();
      if (!workspaceId) {
        console.error('未選擇工作區');
        return;
      }

      const nodeData: Omit<WorkspaceLocationNode, 'id'> = {
        workspaceId,
        name: this.newNode.name,
        nodeType: this.newNode.nodeType as 'root' | 'branch' | 'leaf',
        code: this.newNode.code || undefined,
        note: this.newNode.note || undefined,
        parentId: this.selectedNode?.key || undefined
      };

      await this.workspaceFacade.createLocationNode(nodeData);
      this.cancelAddNode();
      this.loadLocationTree(); // 重新載入樹狀結構
    } catch (error) {
      console.error('新增節點失敗:', error);
    }
  }

  /**
   * 取消新增節點
   */
  cancelAddNode() {
    this.showAddNodeDialog = false;
    this.newNode = {
      name: '',
      nodeType: '',
      code: '',
      note: ''
    };
  }
}