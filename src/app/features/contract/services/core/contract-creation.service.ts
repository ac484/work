// 本服務為合約建立流程服務
// 功能：代理 PDF 上傳與合約建立，簡化元件邏輯
// 用途：新建合約流程的服務層
import { Injectable, inject } from '@angular/core';
import { ContractService } from './contract.service';
import type { Contract } from '../../models';

@Injectable({ providedIn: 'root' })
export class ContractCreationService {
  private contractService = inject(ContractService);

  uploadPdf(file: File): Promise<string> {
    return this.contractService.uploadContractPdf(file);
  }

  createContract(data: Partial<Contract>): Promise<void> {
    return this.contractService.createContract(data);
  }
}