// 本元件為合約管理中樞主畫面
// 功能：多分割區域整合合約列表、詳情、組織、討論、分析等元件
// 用途：合約管理系統的主要操作介面
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { AppSideModule } from '../../shell/layout.sidebar';
import { Observable } from 'rxjs';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';

// 使用模組化匯入
import {
  ContractListComponent,
  TimelineComponent,
  PaymentDetailsComponent,
  OrganizationChartComponent,
  ContractMessagesComponent,
  ContractSummaryComponent,
  PaymentAnalysisComponent,
  EventLogComponent,
  ContractFilesComponent,
  ContractFacadeService,
  Contract
} from '../contract';
import { LayoutService } from '../../core/services/layout/layout.service';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [
    CommonModule, 
    PrimeNgModule, 
    SplitterModule, 
    ContractListComponent, 
    TimelineComponent,
    PaymentDetailsComponent, 
    OrganizationChartComponent, 
    ContractMessagesComponent, 
    ContractSummaryComponent, 
    PaymentAnalysisComponent, 
    EventLogComponent,
    ContractFilesComponent,
    AppSideModule // 新增
  ],
  template: `
    <ng-container *ngIf="!isMobile(); else mobileView">
      <div *ngIf="viewMode() === 'hub'; else projectView">
        <p-splitter [layout]="'horizontal'" [panelSizes]="[50,20,15,10,5]" class="h-screen">
          <!-- 區域1：左1 (50%) - 垂直分割 top:70% / bottom:30% -->
          <ng-template #panel>
            <p-splitter [layout]="'vertical'" [panelSizes]="[70,30]" class="h-full">
              <!-- 左1上：合約列表 (70%) -->
              <ng-template #panel>
                <div class="panel h-full flex flex-col">
                  <app-contract-list class="flex-1 w-full h-full" (rowClick)="onContractRowClick($event)" [selectedId]="(selectedContractId$ | async)" 
                    [tableStateKey]="'contract-list-table'" [tableStateStorage]="'session'"></app-contract-list>
                </div>
              </ng-template>
              <!-- 左1下：請款詳情 (30%) -->
              <ng-template #panel>
                <div class="panel payment-details h-full overflow-auto p-2 border-b">
                  <app-payment-details *ngIf="selectedContractId$ | async as contractId" [contractId]="contractId"></app-payment-details>
                  <div *ngIf="!(selectedContractId$ | async)" class="text-center text-gray-400 py-4">
                    <i class="pi pi-credit-card text-2xl mb-2"></i>
                    <div class="text-sm">請選擇合約查看請款詳情</div>
                  </div>
                </div>
              </ng-template>
            </p-splitter>
          </ng-template>
          
          <!-- 區域2：左2 (20%) - 垂直分割 top:25% / middle:25% / bottom:50% -->
          <ng-template #panel>
            <p-splitter [layout]="'vertical'" [panelSizes]="[25,25,50]" class="h-full">
              <!-- 左2上：組織架構 (25%) -->
              <ng-template #panel>
                <div class="panel organization h-full overflow-auto p-2 border-b">
                  <ng-container *ngIf="selectedContractId$ | async as contractId">
                    <app-organization-chart [contractId]="contractId"></app-organization-chart>
                  </ng-container>
                  <div *ngIf="!(selectedContractId$ | async)" class="text-center text-gray-400 py-4">
                    <i class="pi pi-sitemap text-2xl mb-2"></i>
                    <div class="text-sm">請選擇合約查看組織架構</div>
                  </div>
                </div>
              </ng-template>
              <!-- 左2中：合約摘要 (25%) -->
              <ng-template #panel>
                <div class="panel summary-area h-full overflow-auto p-2 border-b">
                  <ng-container *ngIf="contracts$ | async as contracts">
                    <app-contract-summary [contracts]="contracts"></app-contract-summary>
                  </ng-container>
                </div>
              </ng-template>
              <!-- 左2下：討論區 (50%) -->
              <ng-template #panel>
                <div class="panel messages h-full min-h-0 flex flex-col p-2">
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
            </p-splitter>
          </ng-template>
          
          <!-- 區域3：中 (15%) - 垂直分割 top:65% / middle:15% / bottom:20% -->
          <ng-template #panel>
            <p-splitter [layout]="'vertical'" [panelSizes]="[65,15,20]" class="h-full">
              <!-- 中上：時間線 (65%) -->
              <ng-template #panel>
                <div class="panel timeline h-full overflow-auto">
                  <app-timeline></app-timeline>
                </div>
              </ng-template>
              <!-- 中中：請款分析 (15%) -->
              <ng-template #panel>
                <div class="panel payment-analysis h-full overflow-auto p-2 border-b">
                  <app-payment-analysis [contract]="(selectedContract$ | async) ?? null"></app-payment-analysis>
                </div>
              </ng-template>
              <!-- 中下：事件日誌 (20%) -->
              <ng-template #panel>
                <div class="panel event-log h-full overflow-auto p-2">
                  <app-event-log [contract]="(selectedContract$ | async) ?? null"></app-event-log>
                </div>
              </ng-template>
            </p-splitter>
          </ng-template>
          
          <!-- 區域4：右1 (10%) - 垂直分割 top:60% / middle:20% / bottom:20% -->
          <ng-template #panel>
            <p-splitter [layout]="'vertical'" [panelSizes]="[60,20,20]" class="h-full">
              <!-- 右1上：預留1 (60%) -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border">
                  <div class="text-center">
                    <i class="pi pi-box text-2xl mb-2"></i>
                    <div class="text-sm">區域4-1</div>
                  </div>
                </div>
              </ng-template>
              <!-- 右1中：預留2 (20%) -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border">
                  <div class="text-center">
                    <i class="pi pi-box text-xl mb-1"></i>
                    <div class="text-xs">區域4-2</div>
                  </div>
                </div>
              </ng-template>
              <!-- 右1下：合約檔案 (20%) -->
              <ng-template #panel>
                <div class="panel h-full border">
                  <app-contract-files [contract]="(selectedContract$ | async) ?? null"></app-contract-files>
                </div>
              </ng-template>
            </p-splitter>
          </ng-template>
          
          <!-- 區域5：右2 (5%) - 垂直分割 5 等分 -->
          <ng-template #panel>
            <p-splitter [layout]="'vertical'" [panelSizes]="[20,20,20,20,20]" class="h-full">
              <!-- 右2-1 -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border text-xs">5-1</div>
              </ng-template>
              <!-- 右2-2 -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border text-xs">5-2</div>
              </ng-template>
              <!-- 右2-3 -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border text-xs">5-3</div>
              </ng-template>
              <!-- 右2-4 -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border text-xs">5-4</div>
              </ng-template>
              <!-- 右2-5 -->
              <ng-template #panel>
                <div class="panel placeholder h-full flex items-center justify-center text-gray-500 border text-xs">5-5</div>
              </ng-template>
            </p-splitter>
          </ng-template>
        </p-splitter>
      </div>
      <ng-template #projectView>
        <div class="panel h-screen flex items-center justify-center">
          <div class="text-center text-gray-500">
            <i class="pi pi-folder text-4xl mb-4"></i>
            <div class="text-lg font-medium">專案視角</div>
            <div class="text-sm">此功能將在未來版本中實作</div>
          </div>
        </div>
      </ng-template>
    </ng-container>
    <ng-template #mobileView>
      <div class="flex items-center justify-between p-2 border-b bg-surface-0 sticky top-0 z-10">
        <button (click)="sidebarOpen = true" class="text-2xl p-2"><i class="pi pi-bars"></i></button>
        <span class="font-bold text-lg">合約管理</span>
        <div style="width:2rem"></div>
      </div>
      <p-tabs>
        <p-tab header="合約">
          <app-contract-list class="w-full" (rowClick)="onContractRowClick($event)" [selectedId]="(selectedContractId$ | async)" [tableStateKey]="'contract-list-table'" [tableStateStorage]="'session'"></app-contract-list>
        </p-tab>
        <p-tab header="詳情">
          <app-payment-details *ngIf="selectedContractId$ | async as contractId" [contractId]="contractId"></app-payment-details>
          <div *ngIf="!(selectedContractId$ | async)" class="text-center text-gray-400 py-4">
            <i class="pi pi-credit-card text-2xl mb-2"></i>
            <div class="text-sm">請選擇合約查看請款詳情</div>
          </div>
        </p-tab>
        <p-tab header="討論">
          <ng-container *ngIf="selectedContract$ | async as contract; else messagesSkeleton">
            <app-contract-messages [contract]="contract" class="w-full"></app-contract-messages>
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
        </p-tab>
      </p-tabs>
      <app-left-panel *ngIf="sidebarOpen" [open]="sidebarOpen" (openChange)="onSidebarOpenChange($event)"></app-left-panel>
    </ng-template>
  `
})
export class HubComponent {
  viewMode = AppSideModule.injectViewMode();
  contracts$: Observable<Contract[]>;
  selectedContractId$: Observable<string | null>;
  selectedContract$: Observable<Contract | undefined>;
  layout = inject(LayoutService);
  sidebarOpen = false;
  constructor(private contractFacade: ContractFacadeService) {
    this.contracts$ = this.contractFacade.getContracts();
    this.selectedContractId$ = this.contractFacade.getSelectedContractId();
    this.selectedContract$ = this.contractFacade.getSelectedContract();
  }

  onContractRowClick(contract: { id: string }): void {
    this.contractFacade.setSelectedContract(contract.id);
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  onSidebarOpenChange(open: boolean) {
    this.sidebarOpen = open;
  }
}


