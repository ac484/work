// 本元件用於顯示所有合約的事件時間線
// 功能：整合合約、變更、請款等事件，產生時間軸視覺化
// 用途：合約管理主畫面的活動追蹤區塊
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContractTimelineService } from '../../services/analytics/contract-timeline.service';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { TimelineEvent, Contract, PaymentStatus } from '../../models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, TimelineModule, CardModule],
  template: `
    <p-card class="h-full flex flex-col text-center">
      <p-timeline [value]="timelineEvents" layout="vertical" class="w-full flex-1 h-full overflow-auto">
        <ng-template pTemplate="content" let-event>
          <div class="flex flex-col gap-1 items-center">
            <div class="text-sm font-medium">{{ event.label }}</div>
            <div class="text-xs text-gray-500">{{ event.date | date:'yyyy/MM/dd HH:mm' }}</div>
          </div>
        </ng-template>
        <ng-template pTemplate="marker" let-event>
          <i [class]="getEventIcon(event.type)" [style.color]="getEventColor(event.severity)" class="text-lg"></i>
        </ng-template>
        <ng-template pTemplate="opposite" let-event>
          <small class="text-gray-400">{{ getEventTypeLabel(event.type) }}</small>
        </ng-template>
      </p-timeline>
      <div *ngIf="!timelineEvents.length" class="text-center text-gray-500 py-8 flex-1 flex items-center justify-center">
        <i class="pi pi-clock text-3xl mb-2"></i>
        <div class="text-sm">暫無活動記錄</div>
      </div>
    </p-card>
  `
})
export class TimelineComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  private firestore = inject(Firestore);
  private timelineService = inject(ContractTimelineService);
  
  contracts$: Observable<Contract[] | null>;
  timelineEvents: TimelineEvent[] = [];
  
  constructor() {
    const contractsCol = collection(this.firestore, 'contracts');
    this.contracts$ = collectionData(contractsCol, { idField: 'id' }) as Observable<Contract[] | null>;
    this.contracts$.pipe(takeUntil(this.destroyed$)).subscribe(contracts => {
      if (contracts) {
        this.timelineEvents = this.timelineService.generateTimelineEvents(contracts);
      }
    });
  }
  
  ngOnInit(): void {}
  
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getEventIcon(type: string): string {
    return this.timelineService.getEventIcon(type);
  }
  getEventColor(severity?: string): string {
    return this.timelineService.getEventColor(severity);
  }
  getEventTypeLabel(type: string): string {
    return this.timelineService.getEventTypeLabel(type);
  }
}