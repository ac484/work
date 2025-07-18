// 本服務為合約資料的核心 CRUD 操作
// 功能：合約建立、查詢、更新、PDF 上傳、流水號生成
// 用途：所有合約資料操作的統一入口
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { Contract } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private firestore = inject(Firestore);
  private contractsCol = collection(this.firestore, 'contracts');
  private storage = inject(Storage);
  private refreshSubject = new BehaviorSubject<void>(undefined);

  getContracts(): Observable<Contract[]> {
    return collectionData(this.contractsCol, { idField: 'id' }) as Observable<Contract[]>;
  }

  refreshContracts(): void {
    this.refreshSubject.next();
  }

  updateContractTags(id: string, tags: string[]): Promise<void> {
    const contractDoc = doc(this.firestore, 'contracts', id);
    return updateDoc(contractDoc, { tags });
  }

  async updateContract(contract: Contract): Promise<void> {
    if (!contract.id) {
      throw new Error('合約 ID 不存在');
    }
    const contractDoc = doc(this.firestore, 'contracts', contract.id);
    const { id, ...updateData } = contract;
    await updateDoc(contractDoc, updateData);
  }

  async deleteContract(id: string): Promise<void> {
    const contractDoc = doc(this.firestore, 'contracts', id);
    await deleteDoc(contractDoc);
  }

  getContractById(id: string): Observable<Contract | undefined> {
    const contractDoc = doc(this.firestore, 'contracts', id);
    return new Observable(observer => {
      getDoc(contractDoc).then(docSnap => {
        if (docSnap.exists()) {
          observer.next({ id: docSnap.id, ...docSnap.data() } as Contract);
        } else {
          observer.next(undefined);
        }
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  async uploadContractPdf(file: File): Promise<string> {
    try {
      // 驗證文件類型
      if (!file.type.includes('pdf')) {
        throw new Error('請上傳 PDF 格式的文件');
      }

      const timestamp = Date.now();
      const fileName = `contracts/${timestamp}_${file.name}`;
      const storageRef = ref(this.storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('PDF 上傳失敗:', error);
      throw new Error('PDF 上傳失敗');
    }
  }

  async getNextSerial(): Promise<string> {
    const q = query(this.contractsCol, orderBy('code', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return 'C001';
    }
    
    const lastContract = snapshot.docs[0].data() as Contract;
    const lastCode = lastContract.code;
    const match = lastCode.match(/C(\d+)/);
    
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `C${nextNumber.toString().padStart(3, '0')}`;
    }
    
    return 'C001';
  }

  async createContract(contractData: Partial<Contract>): Promise<void> {
    const code = await this.getNextSerial();
    const newContract: Partial<Contract> = {
      ...contractData,
      code,
      status: '進行中',
      pendingPercent: 100,
      invoicedAmount: 0,
      paymentRound: 0,
      paymentPercent: 0,
      paymentStatus: '草稿',
      invoiceStatus: '未開票',
      payments: [],
      changes: [],
      tags: contractData.tags || []
    };
    
    await addDoc(this.contractsCol, newContract);
  }
}