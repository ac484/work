// 本元件為合約主列表
// 功能：顯示、篩選、標籤編輯、請款、CRUD 操作入口，支援權限控制
// 用途：合約管理主畫面，所有合約一覽
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { ChipsComponent } from '../shared/contract-chips.component';
import { ContractService } from '../../services/core/contract.service';
import { Observable } from 'rxjs';
import { Contract, ContractFilter } from '../../models';
import { FilterService } from 'primeng/api';
import { ContractFilterService } from '../../services/management/contract-filter.service';
import { CreateContractStepperComponent } from '../actions/contract-step.component';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PaymentRequestButtonComponent } from '../payment/contract-payment-request-button.component';
import { PermissionService } from '../../../../core/services/iam/permissions/permission.service';
import { UserService, AppUser } from '../../../../core/services/iam/users/user.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';
import { AmountSummaryComponent } from '../shared/contract-amount-summary.component';
import { ProgressSummaryComponent } from '../analytics/contract-progress-summary.component';
import { ChangeActionsComponent } from '../actions/contract-change-actions.component';
import { ContractSummaryComponent } from '../analytics/contract-summary.component';
import { DialogModule } from 'primeng/dialog';
import { doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule, DialogModule, ChipsComponent, PaymentRequestButtonComponent, AmountSummaryComponent, ProgressSummaryComponent, ChangeActionsComponent, ContractSummaryComponent],
  template: `
    <div class="mb-3 flex justify-between items-center">
      <div class="flex gap-2 items-center">
        <span class="text-sm text-gray-600">共 {{ filteredContracts.length }} 筆合約</span>
        <p-checkbox [(ngModel)]="showCompleted" binary="true" (onChange)="onShowCompletedChange()" inputId="showCompletedContracts" class="ml-2" [style]="{verticalAlign: 'middle'}"></p-checkbox>
        <label for="showCompletedContracts" class="text-xs text-gray-500 cursor-pointer select-none">顯示已完成</label>
      </div>
      <app-contract-summary [contracts]="filteredContracts"></app-contract-summary>
    </div>
    <p-table [value]="filteredContracts"
        class="table-auto w-full text-xs border-collapse"
        [scrollable]="true"
        scrollHeight="flex"
        tableStyleClass="p-datatable-gridlines">
      <ng-template pTemplate="header">
        <tr>
          <th style="width:5%">合約資訊</th>
          <th style="width:12%">專案資訊</th>
          <th style="width:5%">狀態</th>
          <th style="width:13%">合約金額</th>
          <th style="width:5%">進度摘要</th>
          <th style="width:5%">追加/減</th>
          <th style="width:5%">申請</th>
          <th style="width:10%">操作</th>
          <th style="width:20%">標籤</th>
        </tr>
        <tr>
          <th>
            <div class="flex gap-1">
              <input pInputText [(ngModel)]="filter.code" (ngModelChange)="onFilter()" placeholder="合約編號" class="w-1/2 p-1 text-xs border rounded" />
              <input pInputText [(ngModel)]="filter.client" (ngModelChange)="onFilter()" placeholder="業主" class="w-1/2 p-1 text-xs border rounded" />
            </div>
          </th>
          <th>
            <div class="flex gap-1">
              <input pInputText [(ngModel)]="filter.projectName" (ngModelChange)="onFilter()" placeholder="專案名稱" class="w-1/2 p-1 text-xs border rounded" />
              <input pInputText [(ngModel)]="filter.orderNo" (ngModelChange)="onFilter()" placeholder="訂單編號" class="w-1/4 p-1 text-xs border rounded" />
              <input pInputText [(ngModel)]="filter.projectNo" (ngModelChange)="onFilter()" placeholder="專案編號" class="w-1/4 p-1 text-xs border rounded" />
            </div>
          </th>
          <th>
            <!-- 狀態篩選 input 已移除，僅保留空白 -->
          </th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th>
            <div class="flex gap-1 items-center">
              <button type="button" pButton icon="pi pi-filter-slash" size="small"
                      class="p-button-text p-0 text-gray-500 hover:text-primary-500 transition"
                      (click)="clearFilter()" title="清除篩選">
              </button>
              <button type="button" pButton icon="pi pi-refresh" size="small"
                      class="p-button-text p-0"
                      (click)="refreshContracts()" title="重新整理">
              </button>
              <button *ngIf="hasPermission(PERMISSIONS.CREATE_CONTRACT)" 
                      pButton type="button" icon="pi pi-plus" size="small"
                      class="p-button-text p-0 text-primary-500 hover:text-primary-600 transition"
                      (click)="openCreateDialog()" title="新建合約">
              </button>
            </div>
          </th>
          <th>
            <app-chips [tags]="filter.tags || []" (tagsChange)="onTagsChangeFilter($event)" [editable]="true"></app-chips>
          </th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-contract>
        <tr (click)="onRowClick(contract)" class="cursor-pointer hover:bg-gray-50">
          <td>
            <div class="flex flex-col gap-1">
              <span class="font-semibold">{{ contract.code }}</span>
              <span class="text-gray-500">業主：{{ contract.client }}</span>
            </div>
          </td>
          <td>
            <div class="flex flex-col gap-1">
              <span class="font-semibold project-name-ellipsis">{{ contract.projectName }}</span>
              <span class="text-gray-500">訂單編號：{{ contract.orderNo }}</span>
              <span class="text-gray-500">專案編號：{{ contract.projectNo }}</span>
            </div>
          </td>
          <td><span [class]="getStatusClass(contract.status)">{{ contract.status }}</span></td>
          <td><app-amount-summary [contract]="contract"></app-amount-summary></td>
          <td><app-progress-summary [contract]="contract"></app-progress-summary></td>
          <td><app-change-actions [contract]="contract" [user]="user"></app-change-actions></td>
          <td>
            <app-payment-request-button [contract]="contract" [user]="user" icon="pi pi-plus" label="申請" (completed)="onPaymentRequested($event)"></app-payment-request-button>
          </td>
          <td>
            <div class="flex gap-1">
              <button *ngIf="hasPermission(PERMISSIONS.EDIT_CONTRACT)" pButton type="button" icon="pi pi-pencil" size="small"
                      class="p-button-text p-0 text-gray-500 hover:text-primary-500 transition"
                      (click)="onEdit(contract, $event)" title="編輯合約"></button>
              <button *ngIf="hasPermission(PERMISSIONS.DELETE_CONTRACT)" pButton type="button" icon="pi pi-trash" size="small"
                      class="p-button-text p-0 text-red-500 hover:text-red-700 transition"
                      (click)="onDelete(contract, $event)" title="刪除合約"></button>
            </div>
          </td>
          <td>
            <app-chips [tags]="contract.tags || []" (tagsChange)="onTagsChange(contract, $event)"></app-chips>
          </td>
        </tr>
      </ng-template>
    </p-table>
    <p-dialog header="編輯合約" [(visible)]="editDialogVisible" [modal]="true" [style]="{width: '400px'}" (onHide)="cancelEdit()">
      <form *ngIf="editingContract" class="flex flex-col gap-3 p-2">
        <label class="flex flex-col gap-1 text-xs">
          合約編號
          <input pInputText [(ngModel)]="editForm.code" name="code" required />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          訂單編號
          <input pInputText [(ngModel)]="editForm.orderNo" name="orderNo" />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          專案編號
          <input pInputText [(ngModel)]="editForm.projectNo" name="projectNo" />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          專案名稱
          <input pInputText [(ngModel)]="editForm.projectName" name="projectName" />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          業主
          <input pInputText [(ngModel)]="editForm.client" name="client" />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          狀態
          <select pInputText [(ngModel)]="editForm.status" name="status">
            <option value="進行中">進行中</option>
            <option value="已完成">已完成</option>
            <option value="已終止">已終止</option>
          </select>
        </label>
        <div class="flex gap-2 justify-end mt-2">
          <button pButton type="button" label="取消" (click)="cancelEdit()"></button>
          <button pButton type="button" label="儲存" (click)="saveEdit()" [disabled]="!editForm.code"></button>
        </div>
      </form>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .p-datatable td {
      vertical-align: top;
    }
    :host ::ng-deep .project-name-ellipsis {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
  `]
})
export class ContractListComponent implements OnInit {
  contracts$: Observable<Contract[]>;
  filteredContracts: Contract[] = [];
  private allContracts: Contract[] = [];
  filter: ContractFilter = {};
  user: AppUser | null = null;
  userPermissions: string[] = [];
  
  PERMISSIONS = PERMISSIONS;
  
  showCompleted = false;

  private filterService = inject(FilterService);
  private contractFilterService = inject(ContractFilterService);
  private permissionService = inject(PermissionService);
  private userService = inject(UserService);
  private dialogRef?: DynamicDialogRef;

  editDialogVisible = false;
  editingContract: Contract | null = null;
  editForm: Partial<Contract> = {};

  @Output() rowClick = new EventEmitter<{ id: string }>();
  @Input() selectedId: string | null = null;

  constructor(private contractService: ContractService, private dialogService: DialogService) {
    this.contracts$ = this.contractService.getContracts();
    
    this.userService.currentUser$.subscribe(async (user) => {
      this.user = user;
      await this.updatePermissions();
    });
  }

  async ngOnInit(): Promise<void> {
    this.contracts$.subscribe(contracts => {
      this.allContracts = contracts;
      this.applyFilter();
    });
    await this.updatePermissions();
  }

  private async updatePermissions(): Promise<void> {
    if (this.user) {
      this.userPermissions = await this.permissionService.getUserPermissions(this.user);
    } else {
      this.userPermissions = [];
    }
  }

  hasPermission(perm: string): boolean {
    return this.userPermissions.includes(perm);
  }

  getStatusClass(status: Contract['status']): string {
    const statusClasses = {
      '進行中': 'text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs',
      '已完成': 'text-green-600 bg-green-100 px-2 py-1 rounded text-xs',
      '已終止': 'text-red-600 bg-red-100 px-2 py-1 rounded text-xs'
    };
    return statusClasses[status] || 'text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs';
  }

  onFilter(): void {
    this.applyFilter();
  }

  onTagsChangeFilter(tags: string[]): void {
    this.filter.tags = tags;
    this.applyFilter();
  }

  clearFilter(): void {
    this.filter = {};
    this.applyFilter();
  }

  onShowCompletedChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    let filtered = this.contractFilterService.filterContracts(this.allContracts, this.filter);
    if (!this.showCompleted) {
      filtered = filtered.filter(c => c.status !== '已完成');
    }
    this.filteredContracts = filtered;
  }

  refreshContracts(): void {
    this.contracts$ = this.contractService.getContracts();
    this.contracts$.subscribe(contracts => {
      this.allContracts = contracts;
      this.applyFilter();
    });
  }

  onTagsChange(contract: Contract, tags: string[]): void {
    if ((contract as any).id) {
      this.contractService.updateContractTags((contract as any).id, tags);
    }
  }

  onRowClick(contract: Contract): void {
    if ((contract as any).id) {
      this.rowClick.emit({ id: (contract as any).id });
    }
  }

  openCreateDialog(): void {
    if (!this.hasPermission(PERMISSIONS.CREATE_CONTRACT)) {
      alert('您沒有新建合約的權限');
      return;
    }
    
    this.dialogRef = this.dialogService.open(CreateContractStepperComponent, {
      header: '新建合約',
      width: '700px',
      contentStyle: { 'max-height': '80vh', overflow: 'auto' },
      dismissableMask: true,
      closable: true
    });
    
    this.dialogRef.onClose.subscribe(() => {
      this.refreshContracts();
    });
  }

  onPaymentRequested(record: any): void {
    this.refreshContracts();
  }

  onEdit(contract: Contract, event: Event): void {
    event.stopPropagation();
    if (!this.hasPermission(PERMISSIONS.EDIT_CONTRACT)) {
      alert('您沒有編輯合約的權限');
      return;
    }
    this.editingContract = contract;
    this.editForm = {
      code: contract.code,
      orderNo: contract.orderNo,
      projectNo: contract.projectNo,
      projectName: contract.projectName,
      client: contract.client,
      status: contract.status
    };
    this.editDialogVisible = true;
  }

  async saveEdit() {
    if (!this.editingContract) return;
    const updated: Contract = {
      ...this.editingContract,
      ...this.editForm
    };
    const contractDoc = doc(this.contractService['firestore'], 'contracts', updated.id!);
    await updateDoc(contractDoc, {
      code: updated.code,
      orderNo: updated.orderNo,
      projectNo: updated.projectNo,
      projectName: updated.projectName,
      client: updated.client,
      status: updated.status
    });
    this.editDialogVisible = false;
    this.editingContract = null;
    this.refreshContracts();
  }

  cancelEdit() {
    this.editDialogVisible = false;
    this.editingContract = null;
  }

  onDelete(contract: Contract, event: Event): void {
    event.stopPropagation();
    if (!this.hasPermission(PERMISSIONS.DELETE_CONTRACT)) {
      alert('您沒有刪除合約的權限');
      return;
    }
    
    if (confirm('確定要刪除此合約？此操作無法復原。')) {
      alert('刪除功能將在未來版本中實作');
    }
  }
}