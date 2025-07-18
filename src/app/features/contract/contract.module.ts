// 合約模組 - 統一匯出入口
// 功能：集中管理合約相關的所有元件、服務、型別
// 用途：供其他模組統一引用，實現模組化架構
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// === 新架構匯出 ===
// 型別定義
export * from './models';

// 元件
export * from './components';

// 服務
export * from './services';

// 工具函數
export * from './utils';

// 路由
import { contractRoutes } from './contract.routes';

// === 向後相容匯出（舊版本相容性） ===
export { ContractFacadeService } from './services/core/contract-facade.service';

// 核心服務
import { ContractService } from './services/core/contract.service';
import { ContractCreationService } from './services/core/contract-creation.service';
import { ContractFacadeService } from './services/core/contract-facade.service';

// 分析服務
import { ContractAnalyticsService } from './services/analytics/contract-analytics.service';
import { ContractSummaryService } from './services/analytics/contract-summary.service';
import { ContractTimelineService } from './services/analytics/contract-timeline.service';
import { OrganizationChartService } from './services/analytics/contract-organization-chart.service';

// 請款服務
import { PaymentActionService } from './services/payment/contract-payment-action.service';
import { PaymentRequestService } from './services/payment/contract-payment-request.service';

// 管理服務
import { ContractFilterService } from './services/management/contract-filter.service';
import { TagService } from './services/management/contract-tag.service';
import { ContractChangeService } from './services/management/contract-change.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(contractRoutes)
  ],
  providers: [
    // 核心服務
    ContractService,
    ContractCreationService,
    ContractFacadeService,
    
    // 分析服務
    ContractAnalyticsService,
    ContractSummaryService,
    ContractTimelineService,
    OrganizationChartService,
    
    // 請款服務
    PaymentActionService,
    PaymentRequestService,
    
    // 管理服務
    ContractFilterService,
    TagService,
    ContractChangeService
  ]
})
export class ContractModule { }