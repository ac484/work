// 本元件為合約主列表
// 功能：顯示、篩選、標籤編輯、請款、CRUD 操作入口
// 用途：合約管理主畫面，所有合約一覽
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { ChipsComponent } from '../shared/contract-chips.component';
import { ContractService } from '../../services/core/contract.service';
import { Observable } from 'rxjs';
import { Contract, ContractFilter } from '../../models';
import { CreateContractStepperComponent } from '../actions/contract-step.component';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PaymentRequestButtonComponent } from '../payment/contract-payment-request-button.component';
import { UserService, AppUser } from '../../../../core/services/iam/users/user.service';
import { AmountSummaryComponent } from '../shared/contract-amount-summary.component';
import { ProgressSummaryComponent } from '../analytics/contract-progress-summary.component';
import { ChangeActionsComponent } from '../actions/contract-change-actions.component';
import { ContractSummaryComponent } from '../analytics/contract-summary.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule, DialogModule, ChipsComponent, PaymentRequestButtonComponent, AmountSummaryComponent, ProgressSummaryComponent, ChangeActionsComponent, ContractSummaryComponent],
  template: `
    <div class="mb-3 flex gap-4 items-center">
      <div class="flex gap-2 items-center">
        <span class="text-sm text-gray-600">共 {{ filteredContracts.length }} 筆合約</span>
        <p-checkbox [(ngModel)]="showCompleted" binary="true" (onChange)="onShowCompletedChange()" inputId="showCompletedContracts" class="ml-2" [style]="{verticalAlign: 'middle'}"></p-checkbox>
        <label for="showCompletedContracts" class="text-xs text-gray-500 cursor-pointer select-none">顯示已完成</label>
        <app-contract-summary [contracts]="filteredContracts"></app-contract-summary>
      </div>
    </div>
    
    <p-table [value]="filteredContracts"
        class="table-auto w-full text-xs border-collapse"
        [scrollable]="true"
        scrollHeight="flex"
        tableStyleClass="p-datatable-gridlines"
        [stateKey]="tableStateKey"
        [stateStorage]="tableStateStorage">
      <ng-template pTemplate="header">
        <tr>
          <th style="width:5%">合約資訊</th>
          <th style="width:12%">專案資訊</th>
          <th style="width:13%" class="text-[11px]">合約金額</th>
          <th style="width:5%" class="text-[11px]">進度摘要</th>
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
              <button pButton type="button" icon="pi pi-plus" size="small"
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
        <tr (click)="onRowClick(contract)" class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
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
          <td class="text-[10px] text-left whitespace-nowrap">
            <span class="text-[10px] text-left font-semibold whitespace-nowrap">
              <app-amount-summary [contract]="contract"></app-amount-summary>
            </span>
          </td>
          <td class="text-[10px]">
            <span class="text-[10px]">
              <app-progress-summary [contract]="contract"></app-progress-summary>
            </span>
          </td>
          <td><app-change-actions [contract]="contract" [user]="user"></app-change-actions></td>
          <td>
            <app-payment-request-button [contract]="contract" [user]="user" icon="pi pi-plus" label="申請" (completed)="onPaymentRequested($event)"></app-payment-request-button>
          </td>
          <td>
            <div class="flex gap-1">
              <button pButton type="button" icon="pi pi-pencil" size="small"
                      class="p-button-text p-0 text-gray-500 hover:text-primary-500 transition"
                      (click)="onEdit(contract, $event)" title="編輯合約"></button>
              <button pButton type="button" icon="pi pi-trash" size="small"
                      class="p-button-text p-0 text-red-500 hover:text-red-700 transition"
                      (click)="onDelete(contract, $event)" title="刪除合約"></button>
            </div>
          </td>
          <td>
            <app-chips [tags]="contract.tags || []" (tagsChange)="onTagsChange(contract.tags, contract)"></app-chips>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="8">
            <div class="flex flex-col justify-center items-center py-8 text-gray-400">
              <i class="pi pi-file-edit text-4xl mb-4"></i>
              <div class="text-lg text-center font-medium mb-2">
                {{ allContracts.length === 0 ? '尚無合約資料' : '沒有符合條件的合約' }}
              </div>
              <div class="text-sm text-center text-gray-300 mb-4">
                {{ allContracts.length === 0 ? '點擊下方按鈕建立第一個合約' : '請調整篩選條件或清除篩選' }}
              </div>
              <button pButton type="button" icon="pi pi-plus" label="新建合約" 
                      class="p-button-primary"
                      (click)="openCreateDialog()">
              </button>
            </div>
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
  allContracts: Contract[] = []; // 改為 public
  filter: ContractFilter = {};
  user: AppUser | null = null;

  showCompleted = false;

  private userService = inject(UserService);
  private dialogRef?: DynamicDialogRef;
  private cdr = inject(ChangeDetectorRef);

  editDialogVisible = false;
  editingContract: Contract | null = null;
  editForm: Partial<Contract> = {};

  @Output() rowClick = new EventEmitter<{ id: string }>();
  @Input() selectedId: string | null = null;
  @Input() tableStateKey?: string;
  @Input() tableStateStorage: 'session' | 'local' = 'session';

  constructor(private contractService: ContractService, private dialogService: DialogService) {
    this.contracts$ = this.contractService.getContracts();
  }

  async ngOnInit(): Promise<void> {
    this.contracts$.subscribe(contracts => {
      this.allContracts = contracts;
      this.applyFilter();
    });

    this.userService.currentUser$.subscribe({
      next: (user) => {
        console.log('ContractListComponent - 用戶資料更新:', user);
        this.user = user;
        this.cdr.detectChanges(); // Trigger change detection for user data
      },
      error: (error) => {
        console.error('ContractListComponent - 用戶資料載入錯誤:', error);
      }
    });
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
    let filtered = this.allContracts.filter(contract => {
      // 業主篩選
      if (this.filter.client && !contract.client.toLowerCase().includes(this.filter.client.toLowerCase())) {
        return false;
      }

      // 合約編號篩選
      if (this.filter.code && !contract.code.toLowerCase().includes(this.filter.code.toLowerCase())) {
        return false;
      }

      // 訂單編號篩選
      if (this.filter.orderNo && contract.orderNo && !contract.orderNo.toLowerCase().includes(this.filter.orderNo.toLowerCase())) {
        return false;
      }

      // 專案編號篩選
      if (this.filter.projectNo && contract.projectNo && !contract.projectNo.toLowerCase().includes(this.filter.projectNo.toLowerCase())) {
        return false;
      }

      // 專案名稱篩選
      if (this.filter.projectName && contract.projectName && !contract.projectName.toLowerCase().includes(this.filter.projectName.toLowerCase())) {
        return false;
      }

      // 標籤篩選
      if (this.filter.tags && this.filter.tags.length > 0) {
        const contractTags = contract.tags || [];
        const hasAllTags = this.filter.tags.every(tag => contractTags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      return true;
    });

    // 完成狀態篩選
    if (!this.showCompleted) {
      filtered = filtered.filter(c => c.status !== '已完成');
    }

    this.filteredContracts = filtered;
  }

  refreshContracts(): void {
    this.contractService.refreshContracts();
  }

  onTagsChange(contractTags: string[], contract: Contract): void {
    this.contractService.updateContract(contract.id!, { tags: contractTags });
  }

  onRowClick(contract: Contract): void {
    this.rowClick.emit({ id: contract.id! });
  }

  openCreateDialog(): void {
    this.dialogRef = this.dialogService.open(CreateContractStepperComponent, {
      header: '新建合約',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto' },
      baseZIndex: 10000
    });

    this.dialogRef.onClose.subscribe((result: Contract | null) => {
      if (result) {
        this.contractService.refreshContracts();
      }
    });
  }

  onPaymentRequested(record: any): void {
    this.contractService.refreshContracts();
  }

  onEdit(contract: Contract, event: Event): void {
    event.stopPropagation();
    this.editingContract = contract;
    this.editForm = { ...contract };
    this.editDialogVisible = true;
  }

  async saveEdit() {
    if (!this.editingContract || !this.editForm.code) return;
    try {
      await this.contractService.updateContract(this.editingContract.id!, this.editForm);
      this.editDialogVisible = false;
      this.editingContract = null;
      this.editForm = {};
      this.contractService.refreshContracts();
    } catch (error) {
      console.error('更新合約失敗:', error);
      alert('更新合約失敗，請稍後再試');
    }
  }

  cancelEdit() {
    this.editDialogVisible = false;
    this.editingContract = null;
    this.editForm = {};
  }

  onDelete(contract: Contract, event: Event): void {
    event.stopPropagation();
    if (confirm(`確定要刪除合約 "${contract.code}" 嗎？`)) {
      this.contractService.deleteContract(contract.id!);
    }
  }
}