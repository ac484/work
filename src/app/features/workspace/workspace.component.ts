import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { WorkspaceFacadeService } from './services/core/workspace-facade.service';
import { LocationTreeComponent } from './components/tree/location-tree.component';
import { TaskListComponent } from './components/task/task-list.component';
import { WorkspaceOverviewComponent } from './components/workspace/workspace-overview.component';
import { Workspace } from './models';

/**
 * 工作區主元件
 * 整合左側樹狀結構、右側任務列表和概覽資訊的主要介面
 */
@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    SplitterModule,
    PanelModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    LocationTreeComponent,
    TaskListComponent,
    WorkspaceOverviewComponent
  ],
  template: `
    <div class="workspace-container">
      <!-- 工作區選擇器 -->
      <div class="workspace-selector">
        <div class="selector-content">
          <h2>工作區管理</h2>
          <div class="selector-controls">
            <p-select 
              [options]="workspaces()"
              [(ngModel)]="selectedWorkspaceId"
              (onChange)="onWorkspaceChange($event)"
              optionLabel="name"
              optionValue="id"
              placeholder="選擇工作區"
              [style]="{'min-width': '200px'}"
              [loading]="loadingWorkspaces()">
            </p-select>
            <p-button 
              icon="pi pi-plus" 
              label="新增工作區"
              size="small"
              (onClick)="createWorkspace()">
            </p-button>
          </div>
        </div>
      </div>

      <!-- 主要內容區域 -->
      @if (selectedWorkspaceId) {
        <div class="workspace-content">
          <!-- 頂部概覽 -->
          <div class="overview-section">
            <app-workspace-overview></app-workspace-overview>
          </div>

          <!-- 主要工作區域 -->
          <p-splitter 
            [style]="{'height': 'calc(100vh - 300px)'}"
            [panelSizes]="[25, 75]"
            layout="horizontal">
            
            <!-- 左側：位置樹狀結構 -->
            <ng-template pTemplate="panel">
              <div class="tree-panel">
                <app-location-tree></app-location-tree>
              </div>
            </ng-template>

            <!-- 右側：任務管理 -->
            <ng-template pTemplate="panel">
              <div class="task-panel">
                <p-splitter 
                  [style]="{'height': '100%'}"
                  [panelSizes]="[100]"
                  layout="vertical">
                  
                  <ng-template pTemplate="panel">
                    <div class="task-list-section">
                      <app-task-list></app-task-list>
                    </div>
                  </ng-template>
                </p-splitter>
              </div>
            </ng-template>
          </p-splitter>
        </div>
      } @else {
        <!-- 未選擇工作區的狀態 -->
        <div class="no-workspace-selected">
          <div class="welcome-content">
            <i class="pi pi-building text-6xl text-gray-300"></i>
            <h3>歡迎使用工作區管理系統</h3>
            <p class="welcome-description">
              這是一個專為工地管理設計的專案進度追蹤系統，類似 Jira 但更適合工地環境。
              您可以建立工地結構、管理任務、追蹤進度。
            </p>
            
            <div class="feature-list">
              <div class="feature-item">
                <i class="pi pi-sitemap text-primary"></i>
                <span>樹狀工地結構管理</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-list text-primary"></i>
                <span>任務分派與進度追蹤</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-chart-line text-primary"></i>
                <span>專案進度統計分析</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-users text-primary"></i>
                <span>團隊協作與權限管理</span>
              </div>
            </div>

            <div class="action-buttons">
              <p-button 
                label="選擇現有工作區" 
                icon="pi pi-folder-open"
                [outlined]="true"
                (onClick)="focusWorkspaceSelector()">
              </p-button>
              <p-button 
                label="建立新工作區" 
                icon="pi pi-plus"
                (onClick)="createWorkspace()">
              </p-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .workspace-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--surface-ground);
    }

    .workspace-selector {
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      padding: 1rem 1.5rem;
    }

    .selector-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .selector-content h2 {
      margin: 0;
      color: var(--text-color);
      font-size: 1.5rem;
    }

    .selector-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .workspace-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .overview-section {
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      max-height: 300px;
      overflow-y: auto;
    }

    .tree-panel, .task-panel {
      height: 100%;
      background-color: var(--surface-card);
    }

    .task-list-section {
      height: 100%;
      overflow: hidden;
    }

    .no-workspace-selected {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .welcome-content {
      text-align: center;
      max-width: 600px;
    }

    .welcome-content h3 {
      color: var(--text-color);
      margin: 1rem 0;
      font-size: 1.75rem;
    }

    .welcome-description {
      color: var(--text-color-secondary);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .feature-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 2rem 0;
      text-align: left;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background-color: var(--surface-50);
      border-radius: 0.5rem;
    }

    .feature-item i {
      font-size: 1.25rem;
    }

    .feature-item span {
      color: var(--text-color);
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    /* 響應式設計 */
    @media (max-width: 768px) {
      .selector-content {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .selector-controls {
        justify-content: space-between;
      }

      .feature-list {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }

    /* PrimeNG Splitter 樣式調整 */
    :host ::ng-deep .p-splitter {
      border: none;
    }

    :host ::ng-deep .p-splitter-panel {
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .p-splitter-gutter {
      background-color: var(--surface-border);
    }

    :host ::ng-deep .p-splitter-gutter-handle {
      background-color: var(--primary-color);
    }
  `]
})
export class WorkspaceComponent implements OnInit {
  private workspaceFacade = inject(WorkspaceFacadeService);

  // 狀態管理
  workspaces = signal<Workspace[]>([]);
  loadingWorkspaces = signal(false);
  selectedWorkspaceId: string | null = null;

  ngOnInit() {
    this.loadWorkspaces();
    this.subscribeToSelectedWorkspace();
  }

  /**
   * 載入所有工作區
   */
  private loadWorkspaces() {
    this.loadingWorkspaces.set(true);
    
    this.workspaceFacade.getWorkspaces().subscribe({
      next: (workspaces) => {
        this.workspaces.set(workspaces);
        this.loadingWorkspaces.set(false);
        
        // 如果只有一個工作區，自動選擇
        if (workspaces.length === 1) {
          this.selectedWorkspaceId = workspaces[0].id!;
          this.workspaceFacade.setSelectedWorkspace(this.selectedWorkspaceId);
        }
      },
      error: (error) => {
        console.error('載入工作區列表失敗:', error);
        this.loadingWorkspaces.set(false);
      }
    });
  }

  /**
   * 訂閱選中的工作區變更
   */
  private subscribeToSelectedWorkspace() {
    this.workspaceFacade.getSelectedWorkspaceId().subscribe({
      next: (workspaceId) => {
        this.selectedWorkspaceId = workspaceId;
      }
    });
  }

  /**
   * 工作區選擇變更事件
   */
  onWorkspaceChange(event: any) {
    const workspaceId = event.value;
    this.workspaceFacade.setSelectedWorkspace(workspaceId);
  }

  /**
   * 建立新工作區
   */
  createWorkspace() {
    // TODO: 實作新增工作區對話框
    console.log('建立新工作區');
  }

  /**
   * 聚焦到工作區選擇器
   */
  focusWorkspaceSelector() {
    // 滾動到頂部並聚焦選擇器
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}