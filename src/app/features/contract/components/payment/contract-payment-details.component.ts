// 本元件用於顯示單一合約的請款紀錄與操作
// 功能：表格顯示所有請款輪次，支援狀態流轉、歷程顯示
// 用途：合約詳情的請款管理區塊
import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { ContractService } from '../../services/core/contract.service';
import { Observable, of } from 'rxjs';
import { PaymentRecord, PaymentStatus, PaymentAction, PAYMENT_STATUS_TRANSITIONS, Contract } from '../../models';
import { StepperModule } from 'primeng/stepper';
import { UserService, AppUser } from '../../../../core/services/iam/users/user.service';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [CommonModule, PrimeNgModule, StepperModule],
  template: `
    <div *ngIf="contract$ | async as contract" class="h-full flex flex-col">
      <h4 class="font-bold text-base mb-2">請款紀錄（共 {{ contract.payments.length || 0 }} 次）</h4>
      <p-table *ngIf="contract.payments && contract.payments.length" [value]="contract.payments || []" class="table-auto w-full flex-1 overflow-auto text-xs border-collapse">
        <ng-template pTemplate="header">
          <tr>
            <th>輪次</th>
            <th>狀態</th>
            <th>金額</th>
            <th>百分比</th>
            <th>申請人</th>
            <th>日期</th>
            <th>備註</th>
            <th>操作</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td>{{ p.round }}</td>
            <td>
              <span [class]="getStatusClass(p.status)">{{ p.status }}</span>
            </td>
            <td>{{ p.amount | number:'1.0-2' }}</td>
            <td>{{ p.percent }}%</td>
            <td>{{ p.applicant }}</td>
            <td>{{ p.date | date:'yyyy/MM/dd' }}</td>
            <td>{{ p.note }}</td>
            <td>
              <div class="flex gap-1 flex-wrap">
                <button *ngFor="let action of getAvailableActions(p)"
                        pButton type="button" size="small" 
                        (click)="onAction(contract, p, action)"
                        class="px-2 py-1 text-xs rounded bg-primary-500 text-white hover:bg-primary-600 transition">
                  {{ action }}
                </button>
              </div>
              <!-- 請款歷程 -->
              <div *ngIf="p.logs && p.logs.length" class="mt-2 text-xs">
                <details>
                  <summary class="cursor-pointer text-blue-600">歷程 ({{ p.logs.length }})</summary>
                  <div class="mt-1 space-y-1 max-h-24 overflow-y-auto">
                    <div *ngFor="let log of p.logs" class="text-gray-600">
                      <span class="font-medium">{{ log.action }}</span>
                      by {{ log.user }}
                      <span class="text-gray-400">({{ log.timestamp | date:'MM/dd HH:mm' }})</span>
                      <div *ngIf="log.note" class="text-gray-500">{{ log.note }}</div>
                    </div>
                  </div>
                </details>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
      <div *ngIf="!contract.payments?.length" class="p-2 text-xs text-gray-500 flex-1 flex items-center justify-center">尚無請款紀錄</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .p-datatable tbody tr:hover {
      background-color: var(--surface-100) !important;
    }
    :host ::ng-deep .p-datatable tbody tr:hover td {
      background-color: var(--surface-100) !important;
    }
  `]
})
export class PaymentDetailsComponent implements OnChanges {
  @Input() contractId!: string;
  contract$: Observable<Contract | undefined> = of(undefined);
  private user$ = inject(UserService).currentUser$;
  private contractService = inject(ContractService);
  private functions = inject(Functions);
  private cdr = inject(ChangeDetectorRef);
  
  private currentUser: AppUser | null = null;

  constructor() {
    this.user$.subscribe((user) => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractId'] && this.contractId) {
      this.contract$ = this.contractService.getContractById(this.contractId);
    }
  }

  getStatusClass(status: PaymentStatus): string {
    const statusClasses = {
      '草稿': 'text-gray-600 bg-gray-100 px-2 py-1 rounded',
      '待審核': 'text-orange-600 bg-orange-100 px-2 py-1 rounded',
      '待放款': 'text-blue-600 bg-blue-100 px-2 py-1 rounded',
      '放款中': 'text-purple-600 bg-purple-100 px-2 py-1 rounded',
      '完成': 'text-green-600 bg-green-100 px-2 py-1 rounded',
      '拒絕': 'text-red-600 bg-red-100 px-2 py-1 rounded'
    };
    return statusClasses[status] || 'text-gray-600';
  }

  getAvailableActions(payment: PaymentRecord): PaymentAction[] {
    const transitions = PAYMENT_STATUS_TRANSITIONS[payment.status];
    return transitions ? Object.keys(transitions) as PaymentAction[] : [];
  }

  async onAction(contract: Contract, payment: PaymentRecord, action: PaymentAction): Promise<void> {
    if (!this.currentUser) {
      alert('請先登入');
      return;
    }
    
    try {
      // 直接調用 Firebase Function
      const executeAction = httpsCallable(this.functions, 'executePaymentAction');
      const result = await executeAction({
        contractId: contract.id!,
        paymentRound: payment.round,
        action,
        userId: this.currentUser.uid,
        userDisplayName: this.currentUser.displayName || this.currentUser.email || '未知用戶'
      });
      
      if (!(result.data as any).success) {
        throw new Error((result.data as any).error);
      }
      
      // 操作成功後自動計算合約進度
      const calculateProgress = httpsCallable(this.functions, 'calculateContractProgress');
      await calculateProgress({ contractId: contract.id! });
      
      alert('操作成功');
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗，請稍後再試');
    }
  }
}