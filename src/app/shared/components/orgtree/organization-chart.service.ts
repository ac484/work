import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import type { ContractMember } from '../../modules/contract.model';

@Injectable({ providedIn: 'root' })
export class OrganizationChartService {
  membersToTree(members: ContractMember[] | null, projectName = '專案團隊'): TreeNode[] {
    const children: TreeNode[] = (members?.length ? members : Array(3).fill({ name: '', role: '' }))
      .map(m => ({
        label: m.name || '—',
        type: 'person',
        expanded: true,
        data: { ...m }
      }));
    return [{
      label: projectName,
      type: 'person',
      expanded: true,
      data: { name: projectName, role: '' },
      children
    }];
  }

  treeToMembers(tree: TreeNode[] | null): ContractMember[] {
    if (!tree?.length || !tree[0].children) return [];
    return tree[0].children.map(n => ({
      name: n.data?.name || '',
      role: n.data?.role || ''
    }));
  }

  startEdit(node: TreeNode): void {
    node.data._backup = { ...node.data };
    node.data.editing = true;
  }

  saveEdit(node: TreeNode): void {
    delete node.data._backup;
    node.data.editing = false;
  }

  cancelEdit(node: TreeNode): void {
    Object.assign(node.data, node.data._backup);
    delete node.data._backup;
    node.data.editing = false;
  }
} 