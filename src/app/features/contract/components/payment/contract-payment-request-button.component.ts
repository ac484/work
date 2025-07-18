// 本元件為請款申請按鈕與表單
// 功能：金額/百分比動態計算、建立請款草稿
// 用途：合約管理中用戶發起請款申請的入口
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { Contract, PaymentRecord } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Component({
  selector: 'app-payment-request-button',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SliderModule],
  template: `
    <div class="h-full flex flex-col">
      <button pButton type="button" icon="pi pi-wallet" 
              class="px-2 py-1 text-xs rounded bg-primary-500 text-white hover:bg-primary-600 transition" 
              (click)="open()">
        請款
      </button>
      <p-dialog [(visible)]="visible" [modal]="true" [closable]="true" header="請款申請" [style]="{width: '400px'}">
        <div *ngIf="contract" class="flex flex-col gap-4">
          <form (ngSubmit)="createPaymentRequest()" class="flex flex-col gap-4">
            <div>
              <label>申請金額
                <input pInputText type="number" step="0.01" [(ngModel)]="paymentAmount" name="paymentAmount" required (ngModelChange)="onPaymentAmountChange($event)" class="w-full p-2 text-xs border rounded" />
              </label>
            </div>
            <div>
              <label>百分比: {{ paymentPercent }}%</label>
              <p-slider name="paymentPercent" class="w-full" [(ngModel)]="paymentPercent" [min]="0.01" [max]="100" [step]="0.01" (ngModelChange)="onPaymentPercentChange($event)"></p-slider>
            </div>
            <label>備註
              <input pInputText [(ngModel)]="paymentNote" name="paymentNote" class="w-full p-2 text-xs border rounded" />
            </label>
            <div class="flex justify-end gap-2 mt-4">
              <button pButton type="submit" class="px-2 py-1 text-xs rounded bg-primary-500 text-white hover:bg-primary-600 transition" [disabled]="!paymentAmount || !paymentPercent || submitting">
                {{ submitting ? '處理中...' : '創建請款草稿' }}
              </button>
              <button pButton type="button" (click)="close()" class="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition">取消</button>
            </div>
          </form>
        </div>
      </p-dialog>
    </div>
  `
})
export class PaymentRequestButtonComponent implements OnInit {
  @Input() contract: Contract | null = null;
  @Input() user: AppUser | null = null;
  @Output() completed = new EventEmitter<PaymentRecord>();
  
  visible = false;
  paymentAmount: number | null = null;
  paymentPercent: number | null = null;
  paymentNote = '';
  submitting = false;
  
  private functions = inject(Functions);

  ngOnInit(): void {
    // 初始化完成
  }

  open(): void {
    if (!this.contract || !this.user) return;
    
    this.visible = true;
    this.paymentAmount = null;
    this.paymentPercent = 0.01;
    this.onPaymentPercentChange(this.paymentPercent);
    this.paymentNote = '';
    this.submitting = false;
  }

  close(): void {
    this.visible = false;
    this.submitting = false;
  }

  onPaymentAmountChange(val: number): void {
    this.paymentAmount = parseFloat(val.toString());
    if (this.contract && this.contract.contractAmount > 0) {
      const p = (this.paymentAmount / this.contract.contractAmount) * 100;
      this.paymentPercent = parseFloat(p.toFixed(2));
    } else {
      this.paymentPercent = 0.01;
    }
  }

  onPaymentPercentChange(val: number): void {
    const percent = parseFloat(val.toFixed(2));
    this.paymentPercent = percent < 0.01 ? 0.01 : percent;
    if (this.contract && this.contract.contractAmount) {
      const amt = (this.paymentPercent / 100) * this.contract.contractAmount;
      this.paymentAmount = parseFloat(amt.toFixed(2));
    } else {
      this.paymentAmount = null;
    }
  }

  async createPaymentRequest(): Promise<void> {
    if (!this.contract || !this.user || this.paymentAmount === null || this.paymentPercent === null) {
      return;
    }

    this.submitting = true;
    try {
      // 直接調用 Firebase Function
      const createPayment = httpsCallable(this.functions, 'createPaymentRequest');
      const result = await createPayment({
        contractId: this.contract.id!,
        amount: this.paymentAmount,
        percent: this.paymentPercent,
        note: this.paymentNote,
        userId: this.user.uid,
        userDisplayName: this.user.displayName || this.user.email || '未知用戶'
      });
      
      if (!(result.data as any).success) {
        throw new Error((result.data as any).error);
      }
      
      const record = (result.data as any).paymentRecord;
      
      // 建立請款成功後自動計算合約進度
      const calculateProgress = httpsCallable(this.functions, 'calculateContractProgress');
      await calculateProgress({ contractId: this.contract.id! });
      
      this.paymentAmount = null;
      this.paymentPercent = null;
      this.paymentNote = '';
      this.visible = false;
      this.completed.emit(record);
      alert('請款草稿已創建，請至請款詳情頁面送出審核');
    } catch (error: any) {
      console.error('創建請款申請失敗:', error);
      alert('創建請款申請失敗，請稍後再試');
    } finally {
      this.submitting = false;
    }
  }
}