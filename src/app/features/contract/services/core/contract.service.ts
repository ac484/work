// 本服務為合約資料的核心 CRUD 操作
// 功能：合約建立、查詢、更新、PDF 上傳、流水號生成
// 用途：所有合約資料操作的統一入口
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, BehaviorSubject } from 'rxjs';
import { Contract } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private firestore = inject(Firestore);
  private contractsCol = collection(this.firestore, 'contracts');
  private storage = inject(Storage);
  private functions = inject(Functions);
  private refreshSubject = new BehaviorSubject<void>(undefined);

  getContracts(): Observable<Contract[]> {
    return collectionData(this.contractsCol, { idField: 'id' }) as Observable<Contract[]>;
  }

  getContractById(id: string): Observable<Contract | undefined> {
    return new Observable(observer => {
      getDoc(doc(this.contractsCol, id)).then(doc => {
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

  async createContract(data: Partial<Contract>): Promise<void> {
    try {
      // 生成合約流水號
      const generateCode = httpsCallable(this.functions, 'generateContractCode');
      const result = await generateCode({});
      const code = (result.data as any).code;
      
      if (!code) {
        throw new Error('無法生成合約流水號');
      }

      const contractData: Partial<Contract> = {
        ...data,
        code
      };

      await addDoc(this.contractsCol, contractData);
      this.refreshContracts();
    } catch (error) {
      console.error('建立合約失敗:', error);
      throw error;
    }
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<void> {
    const contractRef = doc(this.contractsCol, id);
    await updateDoc(contractRef, data);
    this.refreshContracts();
  }

  async deleteContract(id: string): Promise<void> {
    await deleteDoc(doc(this.contractsCol, id));
    this.refreshContracts();
  }

  async uploadContractPdf(file: File): Promise<string> {
    const timestamp = Date.now();
    const fileName = `contracts/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  refreshContracts(): void {
    this.refreshSubject.next();
  }
}