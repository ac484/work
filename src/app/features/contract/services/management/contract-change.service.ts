// 本服務用於處理合約金額變更（追加/追減）
// 功能：將金額變更記錄寫入 Firestore，更新合約金額與變更紀錄
// 用途：供合約金額調整元件調用
import { Injectable, inject } from '@angular/core';
import { Firestore, doc as firestoreDoc, updateDoc } from '@angular/fire/firestore';
import { Contract } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractChangeService {
  private firestore = inject(Firestore);

  async addChange(
    contract: Contract & { id?: string },
    type: '追加' | '追減',
    amount: number,
    note: string,
    user: any
  ): Promise<void> {
    if (!contract.id) return;
    const changeRecord = {
      type,
      amount,
      note,
      date: new Date().toISOString(),
      user: user?.displayName || user?.email || '未知'
    };
    const updatedChanges = [...(contract.changes || []), changeRecord];
    const contractDoc = firestoreDoc(this.firestore, 'contracts', contract.id);
    const newAmount = type === '追加'
      ? contract.contractAmount + amount
      : contract.contractAmount - amount;
    await updateDoc(contractDoc, {
      contractAmount: newAmount,
      changes: updatedChanges
    });
  }
}