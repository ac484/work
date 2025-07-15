// 角色表單元件
import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { IamFacadeService } from '../../services/core/iam-facade.service';
import { ALL_PERMISSIONS } from '../../../../core/constants/permissions';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [PrimeNgModule, ReactiveFormsModule, FormsModule],
  template: `
    <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="id" class="block text-900 font-medium mb-2">角色 ID *</label>
        <input 
          id="id" 
          type="text" 
          pInputText 
          formControlName="id"
          class="w-full"
          placeholder="請輸入角色 ID（英文）">
        <small class="p-error block" *ngIf="roleForm.get('id')?.invalid && roleForm.get('id')?.touched">
          角色 ID 為必填項目
        </small>
      </div>

      <div class="field">
        <label for="name" class="block text-900 font-medium mb-2">角色名稱 *</label>
        <input 
          id="name" 
          type="text" 
          pInputText 
          formControlName="name"
          class="w-full"
          placeholder="請輸入角色名稱">
        <small class="p-error block" *ngIf="roleForm.get('name')?.invalid && roleForm.get('name')?.touched">
          角色名稱為必填項目
        </small>
      </div>

      <div class="field">
        <label for="description" class="block text-900 font-medium mb-2">描述</label>
        <textarea 
          id="description" 
          pInputTextarea 
          formControlName="description"
          class="w-full"
          rows="3"
          placeholder="請輸入角色描述">
        </textarea>
      </div>

      <div class="field">
        <label class="block text-900 font-medium mb-2">權限設定</label>
        <div class="permission-selection">
          <div class="mb-3">
            <p-button 
              label="全選" 
              [outlined]="true"
              size="small"
              class="mr-2"
              (onClick)="selectAllPermissions()">
            </p-button>
            <p-button 
              label="全不選" 
              [outlined]="true"
              size="small"
              (onClick)="clearAllPermissions()">
            </p-button>
          </div>
          
          <div class="permission-categories">
            <div class="mb-4" *ngFor="let category of getPermissionCategories()">
              <h4 class="text-md font-medium mb-2 text-blue-600">{{ category.name }}</h4>
              <div class="grid">
                <div class="col-12 md:col-6" *ngFor="let permission of category.permissions">
                  <div class="flex align-items-center">
                    <p-checkbox 
                      [value]="permission"
                      (onChange)="onPermissionChange($event)"
                      [ngModel]="isPermissionSelected(permission)"
                      [binary]="true">
                    </p-checkbox>
                    <label class="ml-2 text-sm">{{ getPermissionLabel(permission) }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <p-button 
          label="取消" 
          [outlined]="true"
          (onClick)="onCancel()">
        </p-button>
        <p-button 
          label="儲存" 
          type="submit"
          [disabled]="roleForm.invalid || isLoading"
          [loading]="isLoading">
        </p-button>
      </div>
    </form>
  `
})
export class RoleFormComponent {
  private fb = inject(FormBuilder);
  private iamFacade = inject(IamFacadeService);

  @Output() roleSaved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  roleForm: FormGroup;
  isLoading = false;
  selectedPermissions: string[] = [];

  constructor() {
    this.roleForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      permissions: [[]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.roleForm.valid) {
      this.isLoading = true;

      try {
        const formValue = this.roleForm.value;
        
        await this.iamFacade.createRole({
          id: formValue.id,
          name: formValue.name,
          description: formValue.description,
          permissions: this.selectedPermissions,
          isSystem: false
        });

        this.roleSaved.emit();
      } catch (error) {
        console.error('Create role error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onPermissionChange(event: any): void {
    const permission = event.value;
    if (event.checked) {
      if (!this.selectedPermissions.includes(permission)) {
        this.selectedPermissions.push(permission);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    }
    
    this.roleForm.patchValue({ permissions: this.selectedPermissions });
  }

  isPermissionSelected(permission: string): boolean {
    return this.selectedPermissions.includes(permission);
  }

  selectAllPermissions(): void {
    this.selectedPermissions = [...ALL_PERMISSIONS];
    this.roleForm.patchValue({ permissions: this.selectedPermissions });
  }

  clearAllPermissions(): void {
    this.selectedPermissions = [];
    this.roleForm.patchValue({ permissions: this.selectedPermissions });
  }

  getPermissionCategories() {
    return [
      {
        name: '合約管理',
        permissions: ALL_PERMISSIONS.filter((p: string) => p.includes('contract'))
      },
      {
        name: '請款管理',
        permissions: ALL_PERMISSIONS.filter((p: string) => p.includes('payment'))
      },
      {
        name: '系統管理',
        permissions: ALL_PERMISSIONS.filter((p: string) => p.includes('manage') || p.includes('finance'))
      },
      {
        name: '其他',
        permissions: ALL_PERMISSIONS.filter((p: string) => 
          !p.includes('contract') && 
          !p.includes('payment') && 
          !p.includes('manage') && 
          !p.includes('finance')
        )
      }
    ].filter(c => c.permissions.length > 0);
  }

  getPermissionLabel(permission: string): string {
    // 將權限 ID 轉換為可讀的標籤
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
    
    return labels[permission] || permission;
  }
}