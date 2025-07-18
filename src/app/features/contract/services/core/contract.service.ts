// 本服務為合約資料的核心 CRUD 操作
// 功能：合約建立、查詢、更新、PDF 上傳、流水號生成
// 用途：所有合約資料操作的統一入口
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { Contract } from '../../models';
import { FirebaseFunctionsService } from '../firebase-functions.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private firestore = inject(Firestore);
  private contractsCol = collection(this.firestore, 'contracts');
  private storage = inject(Storage);
  private firebaseFunctions = inject(FirebaseFunctionsService);
  private refreshSubject = new BehaviorSubject<void>(undefined);

  getContracts(): Observable<Contract[]> {
    return collectionData(this.contractsCol, { idField: 'id' }) as Observable<Contract[]>;
  }

  getContractById(id: string): Observable<Contract | undefined> {
    const contractDoc = doc(this.firestore, 'contracts', id);
    return new Observable(observer => {
      getDoc(contractDoc).then(doc => {
        if (doc.exists()) {
          observer.next({ id: doc.id, ...doc.data() } as Contract);
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
    const timestamp = Date.now();
    const fileName = `contracts/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  async getNextSerial(): Promise<string> {
    // 使用 Firebase Function 生成合約流水號
    return await this.firebaseFunctions.generateContractCode();
  }

  async createContract(contractData: Partial<Contract>): Promise<void> {
    // 使用 Firebase Function 生成流水號
    const code = await this.firebaseFunctions.generateContractCode();
    
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

  async updateContract(id: string, updates: Partial<Contract>): Promise<void> {
    const contractDoc = doc(this.firestore, 'contracts', id);
    await updateDoc(contractDoc, updates);
  }

  async deleteContract(id: string): Promise<void> {
    const contractDoc = doc(this.firestore, 'contracts', id);
    await deleteDoc(contractDoc);
  }

  refreshContracts(): void {
    this.refreshSubject.next();
  }

  getRefreshObservable(): Observable<void> {
    return this.refreshSubject.asObservable();
  }
}