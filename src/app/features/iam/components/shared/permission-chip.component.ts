// 權限標籤元件
import { Component, Input } from '@angular/core';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';

@Component({
  selector: 'app-permission-chip',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <p-chip 
      [label]="getPermissionLabel()"
      [icon]="getIcon()"
      [class]="getChipClass()">
    </p-chip>
  `
})
export class PermissionChipComponent {
  @Input() permission!: string;
  @Input() granted = true;
  @Input() size: 'small' | 'normal' = 'normal';

  getPermissionLabel(): string {
    const labels: { [key: string]: string } = {
      'view_contract': '檢視合約',
      'create_contract': '新增合約',
      'edit_contract': '編輯合約',
      'delete_contract': '刪除合約',
      'create_payment_request': '新增請款申請',
      'submit_payment_request': '送出請款申請',
      'cancel_own_payment': '撤回自己的請款申請',
      'review_payment': '審核請款申請',
      'approve_payment': '通過請款申請',
      'reject_payment': '拒絕請款申請',
      'issue_invoice': '開立發票',
      'process_payment': '處理請款',
      'complete_payment': '完成請款',
      'manage_roles': '管理角色',
      'view_finance': '檢視財務',
      'comment_contract': '留言',
      'upload_file': '上傳檔案'
    };
    
    return labels[this.permission] || this.permission;
  }

  getIcon(): string {
    if (this.permission.includes('view')) return 'pi pi-eye';
    if (this.permission.includes('create')) return 'pi pi-plus';
    if (this.permission.includes('edit')) return 'pi pi-pencil';
    if (this.permission.includes('delete')) return 'pi pi-trash';
    if (this.permission.includes('manage')) return 'pi pi-cog';
    if (this.permission.includes('payment')) return 'pi pi-money-bill';
    if (this.permission.includes('contract')) return 'pi pi-file';
    return 'pi pi-key';
  }

  getChipClass(): string {
    const baseClass = this.size === 'small' ? 'p-chip-sm' : '';
    const statusClass = this.granted ? 'permission-granted' : 'permission-denied';
    return `${baseClass} ${statusClass}`;
  }
}