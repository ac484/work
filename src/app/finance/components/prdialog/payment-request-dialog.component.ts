// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import type { Contract, PaymentRecord } from '../../../shared/modules/contract.model';

interface UserInfo {
  displayName?: string;
  email?: string;
}

@Component({
  selector: 'app-payment-request-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, SliderModule],
  templateUrl: './payment-request-dialog.component.html',
  styleUrls: ['./payment-request-dialog.component.scss']
})
export class PaymentRequestDialogComponent {
  @Input() contract: Contract | null = null;
  @Input() user: UserInfo | string | null = null;
  @Output() completed = new EventEmitter<PaymentRecord>();
  visible = false;
  paymentAmount: number | null = null;
  paymentPercent: number | null = null;
  paymentNote = '';
  private firestore = inject(Firestore);

  open(contract: Contract, user: UserInfo | string): void {
    this.contract = contract;
    this.user = user;
    this.visible = true;
    this.paymentAmount = null;
    this.paymentPercent = 0.01;
    this.onPaymentPercentChange(this.paymentPercent);
    this.paymentNote = '';
  }
  close(): void {
    this.visible = false;
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
  async submitPayment(): Promise<void> {
    if (!this.contract || this.paymentAmount === null || this.paymentPercent === null) {
      return;
    }
    const contract = this.contract;
    const payments = Array.isArray(contract.payments) ? contract.payments : [];
    const newRound = payments.length + 1;
    let applicant = '未知';
    const user = this.user;
    if (user != null && typeof user === 'object') {
      applicant = user.displayName ?? user.email ?? '未知';
    } else if (typeof user === 'string') {
      applicant = user;
    }
    const record: PaymentRecord = {
      round: newRound,
      date: new Date().toISOString(),
      amount: this.paymentAmount,
      percent: this.paymentPercent,
      applicant,
      note: this.paymentNote,
      status: '初始'
    };
    payments.push(record);
    const id = contract.id;
    if (id) {
      const contractDoc = firestoreDoc(this.firestore, 'contracts', id);
      await updateDoc(contractDoc, { payments });
    }
    this.paymentAmount = null;
    this.paymentPercent = null;
    this.paymentNote = '';
    this.visible = false;
    this.completed.emit(record);
  }
} 