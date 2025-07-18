// 本元件為合約管理中樞主畫面
// 功能：多分割區域整合合約列表、詳情、討論等元件
// 用途：合約管理系統的主要操作介面
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { AppSideModule } from '../../shell/layout.sidebar';
import { Observable, BehaviorSubject, of, switchMap } from 'rxjs';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';

// 使用模組化匯入
import {
  ContractListComponent,
  PaymentDetailsComponent,
  ContractMessagesComponent,
  ContractSummaryComponent,
  EventLogComponent,
  ContractFilesComponent,
  Contract
} from '../contract';
import { LayoutService } from '../../core/services/layout/layout.service';
import { ContractService } from '../contract/services/core/contract.service';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [
    CommonModule,
    PrimeNgModule,
    SplitterModule,
    ContractListComponent,
    PaymentDetailsComponent,
    ContractMessagesComponent,
    ContractSummaryComponent,
    EventLogComponent,
    ContractFilesComponent
  ],
  template: `
    <div *ngIf="viewMode() === 'hub'; else projectView">
      <p-splitter [layout]="'horizontal'" [panelSizes]="[60,25,15]" class="h-screen">
        <!-- 區域1：左側 (60%) - 垂直分割 top:70% / bottom:30% -->
        <ng-template #panel>
          <p-splitter [layout]="'vertical'" [panelSizes]="[70,30]" class="h-full">
            <!-- 左側上：合約列表 (70%) -->
            <ng-template #panel>
              <div class="panel h-full flex flex-col bg-surface-0 dark:bg-surface-900">
                <app-contract-list class="flex-1 w-full h-full" (rowClick)="onContractRowClick($event)" [selectedId]="(selectedContractId$ | async)"
                  [tableStateKey]="'contract-list-table'" [tableStateStorage]="'session'"></app-contract-list>
              </div>
            </ng-template>
            <!-- 左側下：請款詳情 (30%) -->
            <ng-template #panel>
              <div class="panel payment-details h-full overflow-auto p-2 border-b bg-surface-0 dark:bg-surface-900">
                <app-payment-details *ngIf="selectedContractId$ | async as contractId" [contractId]="contractId"></app-payment-details>
                <div *ngIf="!(selectedContractId$ | async)" class="text-center text-gray-400 py-4">
                  <i class="pi pi-credit-card text-2xl mb-2"></i>
                  <div class="text-sm">請選擇合約查看請款詳情</div>
                </div>
              </div>
            </ng-template>
          </p-splitter>
        </ng-template>
       
        <!-- 區域2：中間 (25%) - 垂直分割 top:30% / middle:40% / bottom:30% -->
        <ng-template #panel>
          <p-splitter [layout]="'vertical'" [panelSizes]="[30,40,30]" class="h-full">
            <!-- 中間上：合約摘要 (30%) -->
            <ng-template #panel>
              <div class="panel summary-area h-full overflow-auto p-2 border-b bg-surface-0 dark:bg-surface-900">
                <ng-container *ngIf="contracts$ | async as contracts">
                  <app-contract-summary [contracts]="contracts"></app-contract-summary>
                </ng-container>
              </div>
            </ng-template>
            <!-- 中間中：討論區 (40%) -->
            <ng-template #panel>
              <div class="panel messages h-full min-h-0 flex flex-col p-2 bg-surface-0 dark:bg-surface-900">
                <ng-container *ngIf="selectedContract$ | async as contract; else messagesSkeleton">
                  <app-contract-messages [contract]="contract" class="flex-1 min-h-0"></app-contract-messages>
                </ng-container>
                <ng-template #messagesSkeleton>
                  <div *ngIf="selectedContractId$ | async" class="space-y-2">
                    <p-skeleton class="w-full h-8"></p-skeleton>
                    <p-skeleton class="w-4/5 h-6"></p-skeleton>
                    <p-skeleton class="w-3/5 h-6"></p-skeleton>
                  </div>
                  <div *ngIf="!(selectedContractId$ | async)" class="text-center text-gray-400 py-4">
                    <i class="pi pi-comments text-2xl mb-2"></i>
                    <div class="text-sm">請選擇合約進行討論</div>
                  </div>
                </ng-template>
              </div>
            </ng-template>
            <!-- 中間下：事件日誌 (30%) -->
            <ng-template #panel>
              <div class="panel event-log h-full overflow-auto p-2 bg-surface-0 dark:bg-surface-900">
                <app-event-log [contract]="(selectedContract$ | async) ?? null"></app-event-log>
              </div>
            </ng-template>
          </p-splitter>
        </ng-template>
       
        <!-- 區域3：右側 (15%) - 合約檔案 -->
        <ng-template #panel>
          <div class="panel h-full p-2 bg-surface-0 dark:bg-surface-900">
            <app-contract-files [contract]="(selectedContract$ | async) ?? null"></app-contract-files>
          </div>
        </ng-template>
      </p-splitter>
    </div>
   
    <ng-template #projectView>
      <div class="panel h-screen flex items-center justify-center bg-surface-0 dark:bg-surface-900">
        <div class="text-center text-gray-500">
          <i class="pi pi-folder text-4xl mb-4"></i>
          <div class="text-lg">專案視圖</div>
          <div class="text-sm">此功能正在開發中</div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .panel {
      /* 移除邊框避免視覺空白 */
    }
  `]
})
export class HubComponent {
  viewMode = AppSideModule.injectViewMode();

  contracts$: Observable<Contract[]>;
  selectedContractId$: Observable<string | null>;
  selectedContract$: Observable<Contract | undefined>;
  layout = inject(LayoutService);
  
  private selectedContractIdSubject = new BehaviorSubject<string | null>(null);
  
  constructor(private contractService: ContractService) {
    this.contracts$ = this.contractService.getContracts();
    this.selectedContractId$ = this.selectedContractIdSubject.asObservable();
    this.selectedContract$ = this.selectedContractId$.pipe(
      switchMap(id => {
        console.log('HubComponent - 選中合約 ID:', id);
        return id ? this.contractService.getContractById(id) : of(undefined);
      })
    );
    
    // 添加調試訂閱
    this.selectedContract$.subscribe(contract => {
      console.log('HubComponent - 選中合約資料:', contract);
    });
  }

  onContractRowClick(contract: { id: string }): void {
    this.selectedContractIdSubject.next(contract.id);
  }
}



