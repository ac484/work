import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { WorkspaceFacadeService } from '../../services/core/workspace-facade.service';
import { Workspace } from '../../models';

/**
 * 工作區概覽元件
 * 顯示工作區的基本資訊、進度統計、任務分佈等概覽資訊
 */
@Component({
  selector: 'app-workspace-overview',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    TagModule,
    ChartModule
  ],
  template: `
    <div class="workspace-overview">
      @if (workspace()) {
        <!-- 工作區基本資訊 -->
        <p-card class="workspace-info-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <h2>{{ workspace()?.name }}</h2>
              <p-tag 
                [value]="workspace()?.status"
                [severity]="getStatusSeverity(workspace()?.status!)">
              </p-tag>
            </div>
          </ng-template>

          <div class="workspace-details">
            <div class="detail-item">
              <label>工地編號:</label>
              <span>{{ workspace()?.code }}</span>
            </div>
            
            <div class="detail-item">
              <label>開始日期:</label>
              <span>{{ formatDate(workspace()?.startDate!) }}</span>
            </div>
            
            @if (workspace()?.endDate) {
              <div class="detail-item">
                <label>結束日期:</label>
                <span>{{ formatDate(workspace()!.endDate!) }}</span>
              </div>
            }
            
            <div class="detail-item">
              <label>整體進度:</label>
              <div class="progress-container">
                <p-progressBar 
                  [value]="workspace()?.progress || 0"
                  [style]="{'width': '200px', 'height': '12px'}"
                  [showValue]="false">
                </p-progressBar>
                <span class="progress-text">{{ workspace()?.progress || 0 }}%</span>
              </div>
            </div>
            
            @if (workspace()?.description) {
              <div class="detail-item">
                <label>專案說明:</label>
                <p class="description">{{ workspace()?.description }}</p>
              </div>
            }
          </div>
        </p-card>

        <!-- 統計資訊 -->
        <div class="stats-grid">
          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon location-icon">
                <i class="pi pi-sitemap"></i>
              </div>
              <div class="stat-info">
                <h3>{{ overview()?.locationCount || 0 }}</h3>
                <p>位置節點</p>
              </div>
            </div>
          </p-card>

          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon task-icon">
                <i class="pi pi-list"></i>
              </div>
              <div class="stat-info">
                <h3>{{ taskStats()?.total || 0 }}</h3>
                <p>總任務數</p>
              </div>
            </div>
          </p-card>

          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon progress-icon">
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="stat-info">
                <h3>{{ taskStats()?.overallProgress || 0 }}%</h3>
                <p>任務進度</p>
              </div>
            </div>
          </p-card>

          <p-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon member-icon">
                <i class="pi pi-users"></i>
              </div>
              <div class="stat-info">
                <h3>{{ workspace()?.members?.length || 0 }}</h3>
                <p>團隊成員</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- 任務狀態分佈 -->
        @if (taskStats()) {
          <div class="charts-grid">
            <p-card class="chart-card">
              <ng-template pTemplate="header">
                <h3>任務狀態分佈</h3>
              </ng-template>
              
              <p-chart 
                type="doughnut" 
                [data]="taskStatusChartData()" 
                [options]="chartOptions"
                [style]="{'height': '300px'}">
              </p-chart>
            </p-card>

            <p-card class="chart-card">
              <ng-template pTemplate="header">
                <h3>任務統計</h3>
              </ng-template>
              
              <div class="task-stats">
                <div class="stat-row">
                  <span class="stat-label">待處理</span>
                  <span class="stat-value pending">{{ taskStats()?.pending || 0 }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">進行中</span>
                  <span class="stat-value in-progress">{{ taskStats()?.inProgress || 0 }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">已完成</span>
                  <span class="stat-value completed">{{ taskStats()?.completed || 0 }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">已取消</span>
                  <span class="stat-value cancelled">{{ taskStats()?.cancelled || 0 }}</span>
                </div>
              </div>
            </p-card>
          </div>
        }

        <!-- 團隊成員 -->
        @if (workspace()?.members && workspace()?.members.length > 0) {
          <p-card class="members-card">
            <ng-template pTemplate="header">
              <h3>團隊成員</h3>
            </ng-template>
            
            <div class="members-grid">
              @for (member of workspace()?.members; track member.name) {
                <div class="member-item">
                  <div class="member-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="member-info">
                    <strong>{{ member.name }}</strong>
                    <span class="member-role">{{ member.role }}</span>
                  </div>
                </div>
              }
            </div>
          </p-card>
        }
      } @else {
        <div class="no-workspace">
          <i class="pi pi-exclamation-triangle text-4xl text-gray-400"></i>
          <p class="text-gray-500 mt-2">請先選擇一個工作區</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .workspace-overview {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .workspace-info-card .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }

    .workspace-info-card h2 {
      margin: 0;
      color: var(--text-color);
    }

    .workspace-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .detail-item label {
      font-weight: 500;
      min-width: 100px;
      color: var(--text-color-secondary);
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-text {
      font-weight: 500;
      color: var(--primary-color);
    }

    .description {
      margin: 0;
      color: var(--text-color);
      line-height: 1.5;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .location-icon { background-color: var(--blue-500); }
    .task-icon { background-color: var(--green-500); }
    .progress-icon { background-color: var(--orange-500); }
    .member-icon { background-color: var(--purple-500); }

    .stat-info h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .stat-info p {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .chart-card h3 {
      margin: 0;
      padding: 1rem;
      color: var(--text-color);
    }

    .task-stats {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border-radius: 0.5rem;
      background-color: var(--surface-50);
    }

    .stat-label {
      font-weight: 500;
    }

    .stat-value {
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }

    .stat-value.pending { background-color: var(--gray-100); color: var(--gray-800); }
    .stat-value.in-progress { background-color: var(--blue-100); color: var(--blue-800); }
    .stat-value.completed { background-color: var(--green-100); color: var(--green-800); }
    .stat-value.cancelled { background-color: var(--red-100); color: var(--red-800); }

    .members-card h3 {
      margin: 0;
      padding: 1rem;
      color: var(--text-color);
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.5rem;
      background-color: var(--surface-50);
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .member-info {
      display: flex;
      flex-direction: column;
    }

    .member-info strong {
      color: var(--text-color);
    }

    .member-role {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .no-workspace {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class WorkspaceOverviewComponent implements OnInit {
  private workspaceFacade = inject(WorkspaceFacadeService);

  // 狀態管理
  workspace = signal<Workspace | undefined>(undefined);
  overview = signal<any>(null);
  taskStats = signal<any>(null);

  // 圖表配置
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  ngOnInit() {
    this.loadWorkspaceOverview();
  }

  /**
   * 載入工作區概覽資訊
   */
  private loadWorkspaceOverview() {
    this.workspaceFacade.getWorkspaceOverview().subscribe({
      next: (overview) => {
        this.workspace.set(overview.workspace);
        this.overview.set(overview);
        this.taskStats.set(overview.taskStatistics);
      },
      error: (error) => {
        console.error('載入工作區概覽失敗:', error);
      }
    });
  }

  /**
   * 獲取狀態標籤樣式
   */
  getStatusSeverity(status: string): string {
    switch (status) {
      case '未開始': return 'secondary';
      case '進行中': return 'info';
      case '已完成': return 'success';
      case '已終止': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * 格式化日期
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('zh-TW');
  }

  /**
   * 任務狀態圖表資料
   */
  taskStatusChartData() {
    const stats = this.taskStats();
    if (!stats) return null;

    return {
      labels: ['待處理', '進行中', '已完成', '已取消'],
      datasets: [{
        data: [stats.pending, stats.inProgress, stats.completed, stats.cancelled],
        backgroundColor: [
          '#6B7280', // 待處理 - 灰色
          '#3B82F6', // 進行中 - 藍色
          '#10B981', // 已完成 - 綠色
          '#EF4444'  // 已取消 - 紅色
        ],
        borderWidth: 0
      }]
    };
  }
}