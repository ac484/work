// 權限矩陣元件 - 顯示角色權限矩陣
import { Component, inject, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { Role } from '../../models/role.model';
import { ALL_PERMISSIONS } from '../../../../core/constants/permissions';

interface PermissionMatrixData {
  permission: string;
  label: string;
  roles: { [roleId: string]: boolean };
}

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [PrimeNgModule, FormsModule],
  template: `
    <div class="permission-matrix-container">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="text-2xl font-bold">權限矩陣</h2>
        <div class="flex gap-2">
          <p-button 
            label="匯出" 
            icon="pi pi-download"
            [outlined]="true"
            (onClick)="exportMatrix()">
          </p-button>
          <p-button 
            label="重新載入" 
            icon="pi pi-refresh"
            [outlined]="true"
            (onClick)="loadMatrix()">
          </p-button>
        </div>
      </div>

      <!-- 篩選器 -->
      <div class="bg-white p-4 border-round shadow-1 mb-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <label class="block text-900 font-medium mb-2">搜尋權限</label>
            <input 
              type="text" 
              pInputText 
              [(ngModel)]="searchTerm"
              (input)="applyFilter()"
              placeholder="搜尋權限名稱"
              class="w-full">
          </div>
          <div class="col-12 md:col-6">
            <label class="block text-900 font-medium mb-2">權限類別</label>
            <p-select 
              [(ngModel)]="categoryFilter"
              (onChange)="applyFilter()"
              [options]="categoryOptions"
              placeholder="選擇類別"
              class="w-full">
            </p-select>
          </div>
        </div>
      </div>

      <!-- 權限矩陣表格 -->
      <div class="bg-white border-round shadow-1">
        <div class="p-4 border-bottom-1 surface-border">
          <h3 class="text-lg font-semibold">角色權限對照表</h3>
        </div>
        
        <div class="matrix-table-container" style="overflow-x: auto;">
          <p-table 
            [value]="filteredMatrix" 
            [loading]="loading"
            styleClass="p-datatable-striped matrix-table">
            
            <ng-template pTemplate="header">
              <tr>
                <th class="sticky-column">權限</th>
                <th *ngFor="let role of roles$ | async" class="text-center min-w-8rem">
                  <div class="flex flex-column align-items-center">
                    <i class="pi pi-users mb-1"></i>
                    <span class="font-medium">{{ role.name }}</span>
                    <small class="text-600">{{ role.id }}</small>
                  </div>
                </th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-item>
              <tr>
                <td class="sticky-column">
                  <div class="flex flex-column">
                    <span class="font-medium">{{ item.label }}</span>
                    <small class="text-600">{{ item.permission }}</small>
                  </div>
                </td>
                <td *ngFor="let role of roles$ | async" class="text-center">
                  <i 
                    [class]="item.roles[role.id] ? 'pi pi-check text-green-500' : 'pi pi-times text-red-400'"
                    [pTooltip]="item.roles[role.id] ? '擁有權限' : '無權限'"
                    class="text-xl">
                  </i>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td [attr.colspan]="((roles$ | async)?.length || 0) + 1" class="text-center py-4">
                  <i class="pi pi-info-circle text-4xl text-400 mb-3"></i>
                  <p class="text-600">暫無權限資料</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- 統計資訊 -->
      <div class="grid mt-4">
        <div class="col-12 md:col-4">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-key text-3xl text-blue-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">總權限數</h4>
            <p class="text-xl font-bold text-900">{{ getAllPermissions().length }}</p>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-users text-3xl text-green-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">總角色數</h4>
            <p class="text-xl font-bold text-900">{{ (roles$ | async)?.length || 0 }}</p>
          </div>
        </div>
        
        <div class="col-12 md:col-4">
          <div class="bg-white p-4 border-round shadow-1 text-center">
            <i class="pi pi-percentage text-3xl text-orange-500 mb-2"></i>
            <h4 class="text-sm font-medium text-600 mb-1">平均權限覆蓋率</h4>
            <p class="text-xl font-bold text-900">{{ getAverageCoverage() }}%</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .matrix-table-container {
      max-height: 600px;
      overflow-y: auto;
    }
    
    .sticky-column {
      position: sticky;
      left: 0;
      background: white;
      z-index: 1;
      min-width: 200px;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    }
    
    .matrix-table th,
    .matrix-table td {
      white-space: nowrap;
      padding: 0.75rem;
    }
    
    .min-w-8rem {
      min-width: 8rem;
    }
  `]
})
export class PermissionMatrixComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);

  roles$!: Observable<Role[]>;
  matrixData: PermissionMatrixData[] = [];
  filteredMatrix: PermissionMatrixData[] = [];
  loading = false;

  // 篩選器
  searchTerm = '';
  categoryFilter = '';

  categoryOptions = [
    { label: '全部', value: '' },
    { label: '合約管理', value: 'contract' },
    { label: '請款管理', value: 'payment' },
    { label: '系統管理', value: 'manage' },
    { label: '其他', value: 'other' }
  ];

  ngOnInit(): void {
    this.loadMatrix();
  }

  loadMatrix(): void {
    this.loading = true;
    // 需要獲取完整的 Role 對象而不是 RoleListItem
    this.roles$ = this.iamFacade.getRoles().pipe(
      map(roleItems => roleItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        permissions: [], // 這裡需要從實際的角色服務獲取權限
        isSystem: item.isSystem,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Role)))
    );

    this.roles$.subscribe(roles => {
      this.buildMatrix(roles);
      this.applyFilter();
      this.loading = false;
    });
  }

  private buildMatrix(roles: Role[]): void {
    this.matrixData = ALL_PERMISSIONS.map((permission: string) => {
      const rolePermissions: { [roleId: string]: boolean } = {};
      
      roles.forEach(role => {
        rolePermissions[role.id] = role.permissions.includes(permission);
      });

      return {
        permission,
        label: this.getPermissionLabel(permission),
        roles: rolePermissions
      };
    });
  }

  applyFilter(): void {
    let filtered = [...this.matrixData];

    // 搜尋篩選
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.permission.toLowerCase().includes(term) ||
        item.label.toLowerCase().includes(term)
      );
    }

    // 類別篩選
    if (this.categoryFilter) {
      filtered = filtered.filter(item => {
        switch (this.categoryFilter) {
          case 'contract':
            return item.permission.includes('contract');
          case 'payment':
            return item.permission.includes('payment');
          case 'manage':
            return item.permission.includes('manage') || item.permission.includes('finance');
          case 'other':
            return !item.permission.includes('contract') && 
                   !item.permission.includes('payment') && 
                   !item.permission.includes('manage') && 
                   !item.permission.includes('finance');
          default:
            return true;
        }
      });
    }

    this.filteredMatrix = filtered;
  }

  exportMatrix(): void {
    // 實現匯出功能
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'permission-matrix.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateCSV(): string {
    // 簡化實現，暫時返回基本的 CSV
    const headers = ['權限', '權限名稱'];
    const rows = this.filteredMatrix.map(item => [
      item.permission,
      item.label
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  getAllPermissions(): string[] {
    return ALL_PERMISSIONS;
  }

  getAverageCoverage(): number {
    if (this.matrixData.length === 0) return 0;
    
    const totalPermissions = this.matrixData.length;
    const totalRoles = Object.keys(this.matrixData[0]?.roles || {}).length;
    
    if (totalRoles === 0) return 0;
    
    const totalGranted = this.matrixData.reduce((sum, item) => {
      return sum + Object.values(item.roles).filter(Boolean).length;
    }, 0);
    
    return Math.round((totalGranted / (totalPermissions * totalRoles)) * 100);
  }

  private getPermissionLabel(permission: string): string {
    const labels: { [key: string]: string } = {
      'view_contract': '檢視合約',
      'create_contract': '新增合約',
      'edit_contract': '編輯合約',
      'delete_contract': '刪除合約',
      'create_payment_request': '新增請款申請',
      'submit_payment_request': '送出請款申請',
      'cancel_own_payment': '撤回自己的請款申請',
      'review_payment': '審核請款申請',
      'approve_payment': '通過請款申請',
      'reject_payment': '拒絕請款申請',
      'issue_invoice': '開立發票',
      'process_payment': '處理請款',
      'complete_payment': '完成請款',
      'manage_roles': '管理角色',
      'view_finance': '檢視財務',
      'comment_contract': '留言',
      'upload_file': '上傳檔案'
    };
    
    return labels[permission] || permission;
  }
}