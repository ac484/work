// 本服務為合約組織架構圖資料產生器
// 功能：根據合約成員產生 PrimeNG TreeNode 結構
// 用途：組織圖元件調用
import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Contract, ContractMember } from '../../models';

@Injectable({ providedIn: 'root' })
export class OrganizationChartService {
  getOrgChartData(contract: Contract | undefined): TreeNode {
    const defaultLabel = '專案團隊';
    if (!contract) {
      return this.getDefaultOrgChartData();
    }
    const members: ContractMember[] = contract.members?.length ? contract.members : Array(3).fill({ name: '', role: '' });
    const children: TreeNode[] = members.map(m => ({
      label: m.name || '—',
      type: 'person',
      expanded: true,
      data: { ...m }
    }));
    return {
      label: contract.projectName || defaultLabel,
      type: 'person',
      expanded: true,
      data: { name: contract.projectName || defaultLabel, role: '' },
      children
    };
  }

  getDefaultOrgChartData(): TreeNode {
    return {
      label: '專案團隊',
      expanded: true,
      children: Array(3).fill(null).map(() => ({
        label: '—',
        type: 'person',
        expanded: true,
        data: { name: '', role: '' }
      }))
    };
  }
}