// 本檔案依據 Firebase Console 專案設定，使用 Firebase Functions
// 功能：極簡 Firebase Functions 調用服務
// 用途：統一處理所有 Functions 調用，最少代碼原則

import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseFunctionsService {
  constructor(private functions: Functions) {}

  // 通用調用方法
  private call<T>(functionName: string, data?: any): Observable<T> {
    const callable = httpsCallable(this.functions, functionName);
    return from(callable(data)).pipe(
      map((result: any) => result.data),
      catchError(error => {
        console.error(`Function ${functionName} 調用失敗:`, error);
        throw new Error(error.message || '函數調用失敗');
      })
    );
  }

  // 一鍵調用所有 Functions
  createContract = (data: any, pdf?: any) => this.call<{ contractId: string; contractCode: string; pdfUrl: string }>('createContract', { contractData: data, pdfFile: pdf });
  requestPayment = (id: string, amount: number, percent: number, note: string) => this.call<{ paymentRecord: any }>('createPaymentRequest', { contractId: id, amount, percent, note });
  updateStatus = (id: string, round: number, action: string) => this.call<{ newStatus: string; actionLog: any }>('executePaymentAction', { contractId: id, paymentRound: round, action });
  calculateProgress = (id: string) => this.call<{ progress: any }>('calculateContractProgress', { contractId: id });
  changeAmount = (id: string, type: '追加' | '追減', amount: number, note: string) => this.call<{ newAmount: number; changeRecord: any }>('addContractChange', { contractId: id, type, amount, note });
  validate = (data: any, type: string) => this.call<{ valid: boolean; errors: string[]; warnings?: string[] }>('validateContract', { contractData: data, validationType: type });
  generateCode = () => this.call<{ code: string }>('generateContractCode');
} 