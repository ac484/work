// 用戶列表元件
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { UserListItem, UserFilter } from '../../models/user.model';
import { UserFormComponent } from './user-form.component';
import { getUserInitials } from '../../utils/user.util.ts';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [PrimeNgModule, FormsModule, UserFormComponent],
  template: `
    <div class="user-list-container">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-bold">用戶管理</h2>
        <p-button 
          label="新增用戶" 
          icon="pi pi-plus"
          (onClick)="showCreateDialog = true">
        </p-button>
      </div>

      <!-- 篩選器 -->
      <div class="filter-section bg-white p-4 border-round shadow-1 mb-4">
        <div class="grid">
          <div class="col-12 md:col-4">
            <label class="block text-900 font-medium mb-2">搜尋</label>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchTerm"
              (input)="applyFilter()"
              placeholder="搜尋用戶名稱或郵件"
              class="w-full">
          </div>
          <div class="col-12 md:col-4">
            <label class="block text-900 font-medium mb-2">狀態</label>
            <p-select 
              [(ngModel)]="statusFilter"
              (onChange)="applyFilter()"
              [options]="statusOptions"
              placeholder="選擇狀態"
              class="w-full">
            </p-select>
          </div>
          <div class="col-12 md:col-4">
            <label class="block text-900 font-medium mb-2">角色</label>
            <p-multiSelect 
              [(ngModel)]="roleFilter"
              (onChange)="applyFilter()"
              [options]="roleOptions"
              placeholder="選擇角色"
              class="w-full">
            </p-multiSelect>
          </div>
        </div>
      </div>

      <!-- 用戶表格 -->
      <div class="bg-white border-round shadow-1">
        <p-table 
          [value]="(users$ | async) || []" 
          [loading]="loading"
          [paginator]="true" 
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="顯示 {first} 到 {last} 筆，共 {totalRecords} 筆"
          [rowsPerPageOptions]="[10, 25, 50]"
          styleClass="p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th>用戶</th>
              <th>角色</th>
              <th>狀態</th>
              <th>最後登入</th>
              <th>操作</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-user>
            <tr>
              <td>
                <div class="flex align-items-center">
                  <p-avatar 
                    [label]="getUserInitials(user)"
                    class="mr-2"
                    size="normal">
                  </p-avatar>
                  <div>
                    <div class="font-medium">{{ user.displayName || '未設定' }}</div>
                    <div class="text-sm text-600">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <p-chip 
                  *ngFor="let role of user.roles" 
                  [label]="role"
                  class="mr-1">
                </p-chip>
              </td>
              <td>
                <p-tag 
                  [value]="user.isActive ? '啟用' : '停用'"
                  [severity]="user.isActive ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                {{ user.lastLoginAt ? (user.lastLoginAt | date:'short') : '從未登入' }}
              </td>
              <td>
                <p-button 
                  icon="pi pi-eye" 
                  [text]="true"
                  (onClick)="viewUser(user.uid)"
                  pTooltip="檢視詳情">
                </p-button>
                <p-button 
                  icon="pi pi-pencil" 
                  [text]="true"
                  (onClick)="editUser(user.uid)"
                  pTooltip="編輯用戶">
                </p-button>
                <p-button 
                  [icon]="user.isActive ? 'pi pi-ban' : 'pi pi-check'" 
                  [text]="true"
                  (onClick)="toggleUserStatus(user.uid)"
                  [pTooltip]="user.isActive ? '停用用戶' : '啟用用戶'">
                </p-button>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-4">
                <i class="pi pi-users text-4xl text-400 mb-3"></i>
                <p class="text-600">暫無用戶資料</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- 新增用戶對話框 -->
    <p-dialog 
      header="新增用戶" 
      [(visible)]="showCreateDialog"
      [modal]="true"
      [style]="{width: '450px'}">
      <app-user-form 
        (userSaved)="onUserSaved()"
        (cancelled)="showCreateDialog = false">
      </app-user-form>
    </p-dialog>
  `
})
export class UserListComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);

  users$!: Observable<UserListItem[]>;
  loading = false;
  showCreateDialog = false;

  // 篩選器
  searchTerm = '';
  statusFilter: boolean | null = null;
  roleFilter: string[] = [];

  statusOptions = [
    { label: '全部', value: null },
    { label: '啟用', value: true },
    { label: '停用', value: false }
  ];

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'User', value: 'user' }
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users$ = this.iamFacade.getUsers();
  }

  applyFilter(): void {
    const filter: UserFilter = {
      searchTerm: this.searchTerm || undefined,
      isActive: this.statusFilter ?? undefined,
      roles: this.roleFilter.length > 0 ? this.roleFilter : undefined
    };

    this.users$ = this.iamFacade.getUsers(filter);
  }

  viewUser(uid: string): void {
    this.iamFacade.setSelectedUser(uid);
    // 導航到用戶詳情頁面
  }

  editUser(uid: string): void {
    this.iamFacade.setSelectedUser(uid);
    // 顯示編輯對話框或導航到編輯頁面
  }

  async toggleUserStatus(uid: string): Promise<void> {
    try {
      await this.iamFacade.toggleUserStatus(uid);
    } catch (error) {
      console.error('Toggle user status error:', error);
    }
  }

  onUserSaved(): void {
    this.showCreateDialog = false;
    this.loadUsers();
  }

  // 使用工具函數
  getUserInitials = getUserInitials;
}