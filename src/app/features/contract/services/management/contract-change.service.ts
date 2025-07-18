// 本服務用於處理合約金額變更（追加/追減）
// 功能：將金額變更記錄寫入 Firestore，更新合約金額與變更紀錄
// 用途：供合約金額調整元件調用
import { Injectable, inject } from '@angular/core';
import { Contract } from '../../models';
import { AppUser } from '../../../../core/services/iam/users/user.service';
import { FirebaseFunctionsService } from '../firebase-functions.service';

@Injectable({
  providedIn: 'root'
})
export class ContractChangeService {
  private firebaseFunctions = inject(FirebaseFunctionsService);

  async addChange(
    contract: Contract & { id?: string },
    type: '追加' | '追減',
    amount: number,
    note: string,
    user: AppUser
  ): Promise<number> {
    if (!contract.id) {
      throw new Error('合約 ID 不存在');
    }

    // 使用 Firebase Function 進行合約變更
    return await this.firebaseFunctions.addContractChange(
      contract.id,
      type,
      amount,
      note,
      user
    );
  }
}