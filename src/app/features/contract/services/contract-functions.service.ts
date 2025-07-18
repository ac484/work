// 本檔案依據 Firebase Console 專案設定，使用 Firebase Functions
// 功能：合約管理專用 Functions 調用服務
// 用途：簡化合約相關操作，最少代碼調用

import { Injectable } from '@angular/core';
import { FirebaseFunctionsService } from '../../../core/services/firebase-functions.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractFunctionsService {
  constructor(private functions: FirebaseFunctionsService) {}

  // 極簡調用 - 直接代理到核心服務
  get createContract() { return this.functions.createContract; }
  get requestPayment() { return this.functions.requestPayment; }
  get updateStatus() { return this.functions.updateStatus; }
  get calculateProgress() { return this.functions.calculateProgress; }
  get changeAmount() { return this.functions.changeAmount; }
  get validate() { return this.functions.validate; }
  get generateCode() { return this.functions.generateCode; }
} 