import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { WorkspaceFacadeService } from '../../services/core/workspace-facade.service';
import { WorkspaceTask, WorkspaceMember } from '../../models';

/**
 * 工作區任務列表元件
 * 顯示當前選中位置的任務列表，支援新增、編輯、狀態更新等操作
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ProgressBarModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    FormsModule
  ],
  template: `
    <div class="task-list-container">
      <div class="task-header">
        <h3>任務清單</h3>
        <p-button 
          icon="pi pi-plus" 
          label="新增任務" 
          size="small"
          (onClick)="showAddTaskDialog = true">
        </p-button>
      </div>

      <p-table 
        [value]="tasks()" 
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="顯示 {first} 到 {last} 筆，共 {totalRecords} 筆"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th>任務名稱</th>
            <th>狀態</th>
            <th>進度</th>
            <th>負責人</th>
            <th>預定完成</th>
            <th>操作</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-task>
          <tr>
            <td>
              <div class="task-title">
                <strong>{{ task.title }}</strong>
                @if (task.description) {
                  <div class="task-description">{{ task.description }}</div>
                }
              </div>
            </td>
            <td>
              <p-tag 
                [value]="task.status"
                [severity]="getStatusSeverity(task.status)">
              </p-tag>
            </td>
            <td>
              <div class="progress-container">
                <p-progressBar 
                  [value]="task.progress || 0"
                  [style]="{'height': '8px'}"
                  [showValue]="false">
                </p-progressBar>
                <span class="progress-text">{{ task.progress || 0 }}%</span>
              </div>
            </td>
            <td>
              <div class="assignees">
                @for (assignee of task.assignees; track assignee.name) {
                  <span class="assignee-chip">{{ assignee.name }}</span>
                }
              </div>
            </td>
            <td>
              @if (task.endDate) {
                <span [class]="getDateClass(task.endDate, task.status)">
                  {{ formatDate(task.endDate) }}
                </span>
              } @else {
                <span class="text-gray-400">未設定</span>
              }
            </td>
            <td>
              <div class="action-buttons">
                <p-button 
                  icon="pi pi-eye" 
                  size="small"
                  [text]="true"
                  pTooltip="查看詳情"
                  (onClick)="viewTask(task)">
                </p-button>
                <p-button 
                  icon="pi pi-pencil" 
                  size="small"
                  [text]="true"
                  pTooltip="編輯任務"
                  (onClick)="editTask(task)">
                </p-button>
                <p-button 
                  icon="pi pi-check" 
                  size="small"
                  [text]="true"
                  pTooltip="更新狀態"
                  (onClick)="updateTaskStatus(task)">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">
              <div class="empty-state">
                <i class="pi pi-inbox text-4xl text-gray-400"></i>
                <p class="text-gray-500 mt-2">此位置尚無任務</p>
                <p-button 
                  label="建立第一個任務" 
                  icon="pi pi-plus"
                  (onClick)="showAddTaskDialog = true">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- 新增/編輯任務對話框 -->
    <p-dialog 
      [header]="editingTask ? '編輯任務' : '新增任務'" 
      [(visible)]="showAddTaskDialog"
      [modal]="true"
      [style]="{width: '600px'}"
      [closable]="true">
      
      <div class="dialog-content">
        <div class="field">
          <label for="taskTitle">任務名稱 *</label>
          <input 
            pInputText 
            id="taskTitle"
            [(ngModel)]="taskForm.title"
            placeholder="請輸入任務名稱"
            class="w-full">
        </div>

        <div class="field">
          <label for="taskDescription">任務說明</label>
          <textarea 
            pTextarea 
            id="taskDescription"
            [(ngModel)]="taskForm.description"
            placeholder="請輸入任務說明"
            rows="3"
            class="w-full">
          </textarea>
        </div>

        <div class="field-group">
          <div class="field">
            <label for="taskStatus">狀態</label>
            <p-select 
              id="taskStatus"
              [(ngModel)]="taskForm.status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="選擇狀態"
              class="w-full">
            </p-select>
          </div>

          <div class="field">
            <label for="taskProgress">進度 (%)</label>
            <input 
              pInputText 
              id="taskProgress"
              type="number"
              min="0"
              max="100"
              [(ngModel)]="taskForm.progress"
              placeholder="0"
              class="w-full">
          </div>
        </div>

        <div class="field-group">
          <div class="field">
            <label for="startDate">預定開始</label>
            <p-datepicker 
              id="startDate"
              [(ngModel)]="taskForm.startDate"
              dateFormat="yy/mm/dd"
              placeholder="選擇開始日期"
              class="w-full">
            </p-datepicker>
          </div>

          <div class="field">
            <label for="endDate">預定完成</label>
            <p-datepicker 
              id="endDate"
              [(ngModel)]="taskForm.endDate"
              dateFormat="yy/mm/dd"
              placeholder="選擇完成日期"
              class="w-full">
            </p-datepicker>
          </div>
        </div>

        <div class="field">
          <label for="taskHours">預估工時</label>
          <input 
            pInputText 
            id="taskHours"
            type="number"
            min="0"
            [(ngModel)]="taskForm.hours"
            placeholder="請輸入預估工時（小時）"
            class="w-full">
        </div>

        <div class="field">
          <label for="taskNote">備註</label>
          <textarea 
            pTextarea 
            id="taskNote"
            [(ngModel)]="taskForm.note"
            placeholder="請輸入備註"
            rows="2"
            class="w-full">
          </textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button 
          label="取消" 
          icon="pi pi-times" 
          [text]="true"
          (onClick)="cancelTask()">
        </p-button>
        <p-button 
          label="確認" 
          icon="pi pi-check"
          (onClick)="confirmTask()"
          [disabled]="!taskForm.title">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .task-list-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .task-header h3 {
      margin: 0;
      color: var(--text-color);
    }

    .task-title strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .task-description {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-text {
      font-size: 0.875rem;
      min-width: 35px;
    }

    .assignees {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .assignee-chip {
      background-color: var(--primary-100);
      color: var(--primary-800);
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
    }

    .dialog-content .field {
      margin-bottom: 1rem;
    }

    .dialog-content .field-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .dialog-content label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .date-overdue {
      color: var(--red-600);
      font-weight: 500;
    }

    .date-warning {
      color: var(--orange-600);
      font-weight: 500;
    }

    .date-normal {
      color: var(--text-color);
    }
  `]
})
export class TaskListComponent implements OnInit {
  private workspaceFacade = inject(WorkspaceFacadeService);

  // 狀態管理
  tasks = signal<WorkspaceTask[]>([]);
  loading = signal(false);
  showAddTaskDialog = false;
  editingTask: WorkspaceTask | null = null;

  // 任務表單
  taskForm = {
    title: '',
    description: '',
    status: '待處理' as WorkspaceTask['status'],
    progress: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
    hours: null as number | null,
    note: ''
  };

  statusOptions = [
    { label: '待處理', value: '待處理' },
    { label: '進行中', value: '進行中' },
    { label: '已完成', value: '已完成' },
    { label: '已取消', value: '已取消' }
  ];

  ngOnInit() {
    this.loadTasks();
  }

  /**
   * 載入任務列表
   */
  private loadTasks() {
    this.loading.set(true);
    
    this.workspaceFacade.getCurrentLocationTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('載入任務列表失敗:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * 獲取狀態標籤樣式
   */
  getStatusSeverity(status: string): string {
    switch (status) {
      case '待處理': return 'secondary';
      case '進行中': return 'info';
      case '已完成': return 'success';
      case '已取消': return 'danger';
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
   * 獲取日期樣式類別
   */
  getDateClass(endDate: string, status: string): string {
    if (status === '已完成') return 'date-normal';
    
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'date-overdue';
    if (diffDays <= 3) return 'date-warning';
    return 'date-normal';
  }

  /**
   * 查看任務詳情
   */
  viewTask(task: WorkspaceTask) {
    // TODO: 實作任務詳情檢視
    console.log('查看任務:', task);
  }

  /**
   * 編輯任務
   */
  editTask(task: WorkspaceTask) {
    this.editingTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      progress: task.progress || 0,
      startDate: task.startDate ? new Date(task.startDate) : null,
      endDate: task.endDate ? new Date(task.endDate) : null,
      hours: task.hours || null,
      note: task.note || ''
    };
    this.showAddTaskDialog = true;
  }

  /**
   * 更新任務狀態
   */
  async updateTaskStatus(task: WorkspaceTask) {
    // TODO: 實作快速狀態更新
    console.log('更新任務狀態:', task);
  }

  /**
   * 確認新增/編輯任務
   */
  async confirmTask() {
    if (!this.taskForm.title) return;

    try {
      const workspaceId = await this.workspaceFacade.getSelectedWorkspaceId().pipe().toPromise();
      const locationId = await this.workspaceFacade.getSelectedLocationId().pipe().toPromise();

      const taskData: Omit<WorkspaceTask, 'id'> = {
        workspaceId: workspaceId || undefined,
        locationId: locationId || undefined,
        title: this.taskForm.title,
        description: this.taskForm.description || undefined,
        status: this.taskForm.status,
        progress: this.taskForm.progress || 0,
        startDate: this.taskForm.startDate?.toISOString() || undefined,
        endDate: this.taskForm.endDate?.toISOString() || undefined,
        hours: this.taskForm.hours || undefined,
        note: this.taskForm.note || undefined,
        assignees: [], // TODO: 實作負責人選擇
        createdAt: new Date().toISOString()
      };

      if (this.editingTask) {
        // TODO: 實作編輯功能
        console.log('編輯任務:', taskData);
      } else {
        await this.workspaceFacade.createTask(taskData);
      }

      this.cancelTask();
      this.loadTasks();
    } catch (error) {
      console.error('儲存任務失敗:', error);
    }
  }

  /**
   * 取消新增/編輯任務
   */
  cancelTask() {
    this.showAddTaskDialog = false;
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      status: '待處理',
      progress: 0,
      startDate: null,
      endDate: null,
      hours: null,
      note: ''
    };
  }
}