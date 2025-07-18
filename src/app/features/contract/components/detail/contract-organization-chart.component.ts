// 本元件用於顯示合約的組織架構圖
// 功能：根據合約成員資料產生組織圖，支援 PrimeNG 組織圖元件
// 用途：合約詳情頁的組織結構視覺化
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { Contract } from '../../models';
import { ContractService } from '../../services/core/contract.service';
import { OrganizationChartService } from '../../services/analytics/contract-organization-chart.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-organization-chart',
  standalone: true,
  imports: [CommonModule, OrganizationChartModule],
  template: `
    <ng-container *ngIf="contract$ | async as contract">
      <div class="w-full h-full p-2">
        <p-organizationChart [value]="[orgService.getOrgChartData(contract)]" [collapsible]="true" class="w-full h-full">
          <ng-template let-node pTemplate="person">
            <div class="flex flex-col items-center gap-1">
              <span class="font-bold mb-1">{{ node.label }}</span>
              <span class="text-xs text-gray-500">{{ node.data.role }}</span>
            </div>
          </ng-template>
        </p-organizationChart>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationChartComponent implements OnChanges {
  @Input() contractId!: string;
  contract$: Observable<Contract | undefined> = of(undefined);
  constructor(
    private contractService: ContractService,
    public orgService: OrganizationChartService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractId'] && this.contractId) {
      this.contract$ = this.contractService.getContractById(this.contractId);
    }
  }
}