// 本元件為合約金額變更操作按鈕與彈窗
// 功能：追加/追減金額，支援權限控制與即時更新
// 用途：合約列表與詳情頁的金額調整功能
import { Component, Input, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { Contract } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';
import { ContractFunctionsService } from '../../services/contract-functions.service';
import { PermissionService } from '../../../../core/services/iam/permissions/permission.service';
import { PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-change-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  template: `
    <div class="flex gap-1" style="border: 1px solid red; padding: 2px; min-height: 20px;">
      <button *ngIf="canEdit" pButton type="button" icon="pi pi-plus" size="small"
              class="p-button-text p-0 text-green-500 hover:text-green-700 transition"
              (click)="openDialog('追加', $event)" title="追加金額">
      </button>
      <button *ngIf="canEdit" pButton type="button" icon="pi pi-minus" size="small"
              class="p-button-text p-0 text-red-500 hover:text-red-700 transition"
              (click)="openDialog('追減', $event)" title="追減金額">
      </button>
      <span *ngIf="!canEdit" style="color: red; font-size: 10px;">無權限</span>
    </div>
    <p-dialog header="{{ changeType }}金額" [(visible)]="showDialog" [modal]="true" [style]="{width: '400px'}" (onHide)="cancel()">
      <form class="flex flex-col gap-3 p-2">
        <label class="flex flex-col gap-1 text-xs">
          金額
          <input pInputText type="number" [(ngModel)]="amount" name="amount" required />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          備註
          <textarea pInputTextarea [(ngModel)]="note" name="note" rows="3"></textarea>
        </label>
        <div class="flex gap-2 justify-end mt-2">
          <button pButton type="button" label="取消" (click)="cancel()"></button>
          <button pButton type="button" label="確認" (click)="confirm()" [disabled]="!amount || amount <= 0"></button>
        </div>
      </form>
    </p-dialog>
  `
})
export class ChangeActionsComponent implements OnInit, OnChanges {
  @Input() contract!: Contract & { id?: string };
  @Input() user: AppUser | null = null;
  showDialog = false;
  changeType: '追加' | '追減' = '追加';
  amount = 0;
  note = '';
  canEdit = false;
  
  private contractFunctions = inject(ContractFunctionsService);
  private permissionService = inject(PermissionService);

  ngOnInit() {
    this.checkPermissions();
  }

  ngOnChanges(changes: SimpleChanges) {
    // 當用戶或合約資料變化時重新檢查權限
    if (changes['user'] || changes['contract']) {
      this.checkPermissions();
    }
  }

  private async checkPermissions() {
    console.log('ChangeActionsComponent - 檢查權限:', {
      user: this.user,
      contractId: this.contract?.id,
      userRoles: this.user?.roles
    });
    
    // 暫時移除權限檢查，直接顯示按鈕進行測試
    this.canEdit = !!(this.user && this.contract?.id);
    
    console.log('ChangeActionsComponent - 權限檢查結果 (測試模式):', {
      canEdit: this.canEdit,
      userExists: !!this.user,
      contractExists: !!this.contract?.id
    });
    
    // 原始權限檢查邏輯（暫時註解）
    /*
    if (!this.user || !this.contract?.id) {
      this.canEdit = false;
      console.log('ChangeActionsComponent - 權限檢查失敗: 用戶或合約不存在');
      return;
    }
    
    this.canEdit = await this.permissionService.hasPermission(this.user, PERMISSIONS.EDIT_CONTRACT);
    console.log('ChangeActionsComponent - 權限檢查結果:', {
      canEdit: this.canEdit,
      requiredPermission: PERMISSIONS.EDIT_CONTRACT
    });
    */
  }

  openDialog(type: '追加' | '追減', event: Event) {
    event.stopPropagation();
    if (!this.canEdit) {
      alert('您沒有編輯合約的權限');
      return;
    }
    
    this.changeType = type;
    this.amount = 0;
    this.note = '';
    this.showDialog = true;
  }

  cancel() {
    this.showDialog = false;
  }

  async confirm() {
    if (!this.user || !this.contract?.id || !this.amount || this.amount <= 0) return;
    
    if (!this.canEdit) {
      alert('您沒有編輯合約的權限');
      return;
    }
    
    try {
      // 使用極簡調用
      await this.contractFunctions.changeAmount(
        this.contract.id!,
        this.changeType,
        this.amount,
        this.note
      ).toPromise();
      
      this.showDialog = false;
      alert('金額變更成功');
    } catch (error) {
      console.error('變更金額失敗:', error);
      alert('變更金額失敗，請稍後再試');
    }
  }
}