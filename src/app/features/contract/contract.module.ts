// 本檔案為合約管理模組
// 功能：合約 CRUD、請款流程、變更管理、檔案上傳
// 用途：合約管理的統一入口
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreModule } from '@angular/fire/firestore';
import { StorageModule } from '@angular/fire/storage';
import { FunctionsModule } from '@angular/fire/functions';
import { PrimeNgModule } from '../../shared/modules/prime-ng.module';

// 元件
import { ContractListComponent } from './components/list/contract-list.component';
import { PaymentRequestButtonComponent } from './components/payment/contract-payment-request-button.component';
import { PaymentDetailsComponent } from './components/payment/contract-payment-details.component';
import { CreateContractStepperComponent } from './components/actions/contract-step.component';
import { ChangeActionsComponent } from './components/actions/contract-change-actions.component';
import { ChipsComponent } from './components/shared/contract-chips.component';
import { AmountSummaryComponent } from './components/shared/contract-amount-summary.component';
import { ProgressSummaryComponent } from './components/analytics/contract-progress-summary.component';
import { ContractSummaryComponent } from './components/analytics/contract-summary.component';
import { EventLogComponent } from './components/detail/contract-event-log.component';
import { ContractFilesComponent } from './components/detail/contract-files.component';
import { ContractMessagesComponent } from './components/detail/contract-messages.component';

// 服務
import { ContractService } from './services/core/contract.service';
import { PaymentRequestService } from './services/payment/contract-payment-request.service';
import { PaymentActionService } from './services/payment/contract-payment-action.service';
import { ContractFilterService } from './services/management/contract-filter.service';
import { ContractChangeService } from './services/management/contract-change.service';
import { TagService } from './services/management/contract-tag.service';
import { ContractAnalyticsService } from './services/analytics/contract-analytics.service';
import { FirebaseFunctionsService } from './services/firebase-functions.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    FirestoreModule,
    StorageModule,
    FunctionsModule,
    PrimeNgModule,
    // 元件
    ContractListComponent,
    PaymentRequestButtonComponent,
    PaymentDetailsComponent,
    CreateContractStepperComponent,
    ChangeActionsComponent,
    ChipsComponent,
    AmountSummaryComponent,
    ProgressSummaryComponent,
    ContractSummaryComponent,
    EventLogComponent,
    ContractFilesComponent,
    ContractMessagesComponent
  ],
  providers: [
    ContractService,
    PaymentRequestService,
    PaymentActionService,
    ContractFilterService,
    ContractChangeService,
    TagService,
    ContractAnalyticsService,
    FirebaseFunctionsService
  ]
})
export class ContractModule { }