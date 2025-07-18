// 本元件為合約金額變更操作按鈕與彈窗
// 功能：追加/追減金額，支援權限控制與即時更新
// 用途：合約列表與詳情頁的金額調整功能
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { Contract } from '../../models';
import { ContractChangeService } from '../../services/management/contract-change.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-change-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  template: `
    <div class="flex gap-1">
      <button *ngIf="canEdit()" pButton type="button" icon="pi pi-plus" size="small"
              class="p-button-text p-0 text-green-500 hover:text-green-700 transition"
              (click)="openDialog('追加', $event)" title="追加金額">
      </button>
      <button *ngIf="canEdit()" pButton type="button" icon="pi pi-minus" size="small"
              class="p-button-text p-0 text-red-500 hover:text-red-700 transition"
              (click)="openDialog('追減', $event)" title="追減金額">
      </button>
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
export class ChangeActionsComponent {
  @Input() contract!: Contract & { id?: string };
  @Input() user: any;
  showDialog = false;
  changeType: '追加' | '追減' = '追加';
  amount = 0;
  note = '';
  private firestore = inject(Firestore);

  canEdit(): boolean {
    return !!this.user && !!this.contract?.id;
  }

  openDialog(type: '追加' | '追減', event: Event) {
    event.stopPropagation();
    if (!this.canEdit()) return;
    this.changeType = type;
    this.amount = 0;
    this.note = '';
    this.showDialog = true;
  }

  cancel() {
    this.showDialog = false;
  }

  async confirm() {
    if (!this.canEdit() || !this.amount || this.amount <= 0) return;
    
    try {
      const changeService = new ContractChangeService();
      await changeService.addChange(this.contract, this.changeType, this.amount, this.note, this.user);
      this.showDialog = false;
      // 可以發出事件通知父元件刷新
    } catch (error) {
      console.error('變更金額失敗:', error);
      alert('變更金額失敗，請稍後再試');
    }
  }
}