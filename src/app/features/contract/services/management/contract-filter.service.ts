// 本服務為合約篩選服務
// 功能：多條件篩選、標籤過濾、狀態管理
// 用途：合約列表的搜尋與過濾功能
import { Injectable, inject } from '@angular/core';
import { Contract, ContractFilter } from '../../models';
import { FilterService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ContractFilterService {
  private activeFilter: ContractFilter = {};
  
  constructor(private filterService: FilterService) {}

  setActiveFilter(filter: ContractFilter): void {
    this.activeFilter = { ...filter };
  }

  getActiveFilter(): ContractFilter {
    return { ...this.activeFilter };
  }

  filterContracts(contracts: Contract[], filter: ContractFilter, showCompleted: boolean = true): Contract[] {
    let filtered = this.applyFilter(contracts, filter);
    
    if (!showCompleted) {
      filtered = filtered.filter(c => c.status !== '已完成');
    }
    
    return filtered;
  }

  private applyFilter(contracts: Contract[], filter: ContractFilter): Contract[] {
    return contracts.filter(contract => {
      // 業主篩選
      if (filter.client && !contract.client.toLowerCase().includes(filter.client.toLowerCase())) {
        return false;
      }

      // 合約編號篩選
      if (filter.code && !contract.code.toLowerCase().includes(filter.code.toLowerCase())) {
        return false;
      }

      // 訂單編號篩選
      if (filter.orderNo && contract.orderNo && !contract.orderNo.toLowerCase().includes(filter.orderNo.toLowerCase())) {
        return false;
      }

      // 專案編號篩選
      if (filter.projectNo && contract.projectNo && !contract.projectNo.toLowerCase().includes(filter.projectNo.toLowerCase())) {
        return false;
      }

      // 專案名稱篩選
      if (filter.projectName && contract.projectName && !contract.projectName.toLowerCase().includes(filter.projectName.toLowerCase())) {
        return false;
      }

      // 狀態篩選
      if (filter.status && contract.status !== filter.status) {
        return false;
      }

      // 金額範圍篩選
      if (filter.minAmount !== undefined && contract.contractAmount < filter.minAmount) {
        return false;
      }
      if (filter.maxAmount !== undefined && contract.contractAmount > filter.maxAmount) {
        return false;
      }

      // 標籤篩選
      if (filter.tags && filter.tags.length > 0) {
        const contractTags = contract.tags || [];
        const hasAllTags = filter.tags.every(tag => contractTags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      // 日期範圍篩選
      if (filter.dateFrom && contract.orderDate && contract.orderDate < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && contract.orderDate && contract.orderDate > filter.dateTo) {
        return false;
      }

      return true;
    });
  }
}