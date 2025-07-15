// 角色列表元件
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { RoleListItem, RoleFilter } from '../../models/role.model';
import { RoleFormComponent } from './role-form.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [PrimeNgModule, FormsModule, RoleFormComponent],
  template: `
    <div class="role-list-container">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-bold">角色管理</h2>
        <p-button 
          label="新增角色" 
          icon="pi pi-plus"
          (onClick)="showCreateDialog = true">
        </p-button>
      </div>

      <!-- 篩選器 -->
      <div class="filter-section bg-white p-4 border-round shadow-1 mb-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <label class="block text-900 font-medium mb-2">搜尋</label>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchTerm"
              (input)="applyFilter()"
              placeholder="搜尋角色名稱或描述"
              class="w-full">
          </div>
          <div class="col-12 md:col-6">
            <label class="block text-900 font-medium mb-2">類型</label>
            <p-select 
              [(ngModel)]="typeFilter"
              (onChange)="applyFilter()"
              [options]="typeOptions"
              placeholder="選擇類型"
              class="w-full">
            </p-select>
          </div>
        </div>
      </div>

      <!-- 角色表格 -->
      <div class="bg-white border-round shadow-1">
        <p-table 
          [value]="(roles$ | async) || []" 
          [loading]="loading"
          [paginator]="true" 
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="顯示 {first} 到 {last} 筆，共 {totalRecords} 筆"
          [rowsPerPageOptions]="[10, 25, 50]"
          styleClass="p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th>角色名稱</th>
              <th>描述</th>
              <th>權限數量</th>
              <th>用戶數量</th>
              <th>類型</th>
              <th>操作</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-role>
            <tr>
              <td>
                <div class="flex align-items-center">
                  <i class="pi pi-users text-blue-500 mr-2"></i>
                  <div>
                    <div class="font-medium">{{ role.name }}</div>
                    <div class="text-sm text-600">{{ role.id }}</div>
                  </div>
                </div>
              </td>
              <td>{{ role.description }}</td>
              <td>
                <p-tag 
                  [value]="role.permissionCount.toString()"
                  severity="info">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="role.userCount.toString()"
                  severity="success">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="role.isSystem ? '系統角色' : '自定義'"
                  [severity]="role.isSystem ? 'warning' : 'secondary'">
                </p-tag>
              </td>
              <td>
                <p-button 
                  icon="pi pi-eye" 
                  [text]="true"
                  (onClick)="viewRole(role.id)"
                  pTooltip="檢視詳情">
                </p-button>
                <p-button 
                  icon="pi pi-pencil" 
                  [text]="true"
                  (onClick)="editRole(role.id)"
                  pTooltip="編輯角色">
                </p-button>
                <p-button 
                  icon="pi pi-trash" 
                  [text]="true"
                  severity="danger"
                  [disabled]="role.isSystem"
                  (onClick)="deleteRole(role.id)"
                  pTooltip="刪除角色">
                </p-button>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-4">
                <i class="pi pi-users text-4xl text-400 mb-3"></i>
                <p class="text-600">暫無角色資料</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- 新增角色對話框 -->
    <p-dialog 
      header="新增角色" 
      [(visible)]="showCreateDialog"
      [modal]="true"
      [style]="{width: '600px'}">
      <app-role-form 
        (roleSaved)="onRoleSaved()"
        (cancelled)="showCreateDialog = false">
      </app-role-form>
    </p-dialog>

    <!-- 刪除確認對話框 -->
    <p-confirmDialog></p-confirmDialog>
  `
})
export class RoleListComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);

  roles$!: Observable<RoleListItem[]>;
  loading = false;
  showCreateDialog = false;

  // 篩選器
  searchTerm = '';
  typeFilter: boolean | null = null;

  typeOptions = [
    { label: '全部', value: null },
    { label: '系統角色', value: true },
    { label: '自定義角色', value: false }
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roles$ = this.iamFacade.getRoles();
  }

  applyFilter(): void {
    const filter: RoleFilter = {
      searchTerm: this.searchTerm || undefined,
      isSystem: this.typeFilter ?? undefined
    };

    this.roles$ = this.iamFacade.getRoles(filter);
  }

  viewRole(roleId: string): void {
    this.iamFacade.setSelectedRole(roleId);
    // 導航到角色詳情頁面
  }

  editRole(roleId: string): void {
    this.iamFacade.setSelectedRole(roleId);
    // 顯示編輯對話框或導航到編輯頁面
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      await this.iamFacade.deleteRole(roleId);
      this.loadRoles();
    } catch (error) {
      console.error('Delete role error:', error);
    }
  }

  onRoleSaved(): void {
    this.showCreateDialog = false;
    this.loadRoles();
  }
}