// 合約門面服務 - 統一業務邏輯入口
// 功能：整合各個專門服務，提供統一的業務邏輯入口
// 用途：供外部模組調用，實現低耦合高內聚的架構設計
import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { Contract, ContractFilter, ContractListItem } from '../../models';
import { ContractService } from './contract.service';
import { ContractAnalyticsService } from '../analytics/contract-analytics.service';
import { ContractSummaryService } from '../analytics/contract-summary.service';
import { ContractFilterService } from '../management/contract-filter.service';
import { ContractTimelineService } from '../analytics/contract-timeline.service';

@Injectable({ providedIn: 'root' })
export class ContractFacadeService {
  private contractService = inject(ContractService);
  private analyticsService = inject(ContractAnalyticsService);
  private summaryService = inject(ContractSummaryService);
  private filterService = inject(ContractFilterService);
  private timelineService = inject(ContractTimelineService);

  // 狀態管理
  private selectedContractId$ = new BehaviorSubject<string | null>(null);
  
  // 快取的資料流
  private contracts$ = this.contractService.getContracts().pipe(
    shareReplay(1)
  );

  // ===== 狀態管理 =====
  setSelectedContract(id: string | null): void {
    this.selectedContractId$.next(id);
  }

  getSelectedContractId(): Observable<string | null> {
    return this.selectedContractId$.pipe(distinctUntilChanged());
  }

  getSelectedContract(): Observable<Contract | undefined> {
    return combineLatest([
      this.contracts$,
      this.selectedContractId$
    ]).pipe(
      map(([contracts, selectedId]) => 
        selectedId ? contracts.find(c => c.id === selectedId) : undefined
      ),
      distinctUntilChanged()
    );
  }

  // ===== 合約基本操作 =====
  getContracts(): Observable<Contract[]> {
    return this.contracts$;
  }

  getContractById(id: string): Observable<Contract | undefined> {
    return this.contracts$.pipe(
      map(contracts => contracts.find(c => c.id === id)),
      distinctUntilChanged()
    );
  }

  getContractList(): Observable<ContractListItem[]> {
    return this.contracts$.pipe(
      map(contracts => contracts.map(contract => ({
        id: contract.id!,
        code: contract.code,
        status: contract.status,
        projectName: contract.projectName || '',
        contractAmount: contract.contractAmount,
        tags: contract.tags,
        url: contract.url
      })))
    );
  }

  // ===== 合約篩選 =====
  getFilteredContracts(filter: ContractFilter): Observable<Contract[]> {
    return this.contracts$.pipe(
      map(contracts => this.filterService.filterContracts(contracts, filter))
    );
  }

  // ===== 合約分析 =====
  getContractAnalytics(): Observable<any> {
    return this.contracts$.pipe(
      map(contracts => this.analyticsService.calculateAnalytics(contracts)),
      shareReplay(1)
    );
  }

  getContractSummary(): Observable<any> {
    return this.contracts$.pipe(
      map(contracts => this.summaryService.generateSummary(contracts)),
      shareReplay(1)
    );
  }

  // ===== 合約時間線 =====
  getContractTimeline(contractId?: string): Observable<any[]> {
    if (contractId) {
      return this.getContractById(contractId).pipe(
        map(contract => contract ? this.timelineService.generateTimeline(contract) : [])
      );
    }
    return this.contracts$.pipe(
      map(contracts => this.timelineService.generateGlobalTimeline(contracts)),
      shareReplay(1)
    );
  }

  // ===== 合約操作 =====
  async createContract(contractData: Partial<Contract>): Promise<void> {
    return this.contractService.createContract(contractData);
  }

  async updateContractTags(id: string, tags: string[]): Promise<void> {
    return this.contractService.updateContractTags(id, tags);
  }

  async uploadContractPdf(file: File): Promise<string> {
    return this.contractService.uploadContractPdf(file);
  }

  async getNextSerial(): Promise<string> {
    return this.contractService.getNextSerial();
  }
}