// 本服務為合約資料的核心 CRUD 操作
// 功能：合約建立、查詢、更新、PDF 上傳、流水號生成
// 用途：所有合約資料操作的統一入口
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Contract } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private firestore = inject(Firestore);
  private contractsCol = collection(this.firestore, 'contracts');
  private refreshSubject = new BehaviorSubject<void>(undefined);

  getContracts(): Observable<Contract[]> {
    return collectionData(this.contractsCol, { idField: 'id' }) as Observable<Contract[]>;
  }

  getContractById(id: string): Observable<Contract | undefined> {
    console.log('ContractService - 查詢合約 ID:', id);
    return new Observable(observer => {
      getDoc(doc(this.contractsCol, id)).then(doc => {
        if (doc.exists()) {
          const contract = { id: doc.id, ...doc.data() } as Contract;
          console.log('ContractService - 找到合約:', contract);
          observer.next(contract);
        } else {
          console.log('ContractService - 合約不存在:', id);
          observer.next(undefined);
        }
        observer.complete();
      }).catch(error => {
        console.error('ContractService - 查詢合約錯誤:', error);
        observer.error(error);
      });
    });
  }

  // 合約建立功能已移動到 Firebase Functions
  // 請使用 createContract Function 進行合約建立

  async updateContract(id: string, data: Partial<Contract>): Promise<void> {
    const contractRef = doc(this.contractsCol, id);
    await updateDoc(contractRef, data);
    this.refreshContracts();
  }

  async deleteContract(id: string): Promise<void> {
    await deleteDoc(doc(this.contractsCol, id));
    this.refreshContracts();
  }

  // PDF 上傳功能已整合到 Firebase Functions 的 createContract 中
  // 請使用 createContract Function 進行合約建立與 PDF 上傳

  refreshContracts(): void {
    this.refreshSubject.next();
  }
}