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

// 服務
import { ContractService } from './services/core/contract.service';
import { ContractAnalyticsService } from './services/analytics/contract-analytics.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    FirestoreModule,
    StorageModule,
    FunctionsModule,
    PrimeNgModule
  ],
  providers: [
    ContractService,
    ContractAnalyticsService
  ]
})
export class ContractModule { }