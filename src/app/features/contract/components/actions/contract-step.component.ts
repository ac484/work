// 本元件為合約建立流程的步驟式表單
// 功能：三步驟建立合約（基本資訊、成員設定、檔案上傳）
// 用途：新建合約的統一入口
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';
import { Contract, ContractMember } from '../../models';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Component({
  selector: 'app-create-contract-stepper',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm font-semibold">步驟 {{ step }} / 3</span>
        <div class="flex gap-2">
          <div *ngFor="let i of [1,2,3]" 
               [class]="i <= step ? 'w-3 h-3 bg-primary-500 rounded-full' : 'w-3 h-3 bg-gray-300 rounded-full'">
          </div>
        </div>
      </div>

      <!-- 步驟 1: 基本資訊 -->
      <div *ngIf="step === 1" class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold mb-2">基本資訊</h3>
        <label class="flex flex-col gap-1 text-xs">
          訂單編號 *
          <input pInputText [(ngModel)]="orderNo" required />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          專案編號 *
          <input pInputText [(ngModel)]="projectNo" required />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          專案名稱 *
          <input pInputText [(ngModel)]="projectName" required />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          業主 *
          <input pInputText [(ngModel)]="client" required />
        </label>
        <label class="flex flex-col gap-1 text-xs">
          合約金額 *
          <input pInputText type="number" [(ngModel)]="contractAmount" required />
        </label>
        <div class="flex justify-end mt-4">
          <button pButton type="button" label="下一步" 
                  [disabled]="!orderNo || !projectNo || !projectName || !client || !contractAmount"
                  (click)="step = 2">
          </button>
        </div>
      </div>

      <!-- 步驟 2: 成員設定 -->
      <div *ngIf="step === 2" class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold mb-2">成員設定</h3>
        <div *ngFor="let member of members; let i = index" class="flex gap-2 items-center">
          <input pInputText [(ngModel)]="member.name" placeholder="姓名" class="flex-1" />
          <select pInputText [(ngModel)]="member.role" class="w-24">
            <option value="專案經理">專案經理</option>
            <option value="工程師">工程師</option>
            <option value="業務">業務</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="flex justify-between mt-4">
          <button pButton type="button" label="上一步" (click)="step = 1"></button>
          <button pButton type="button" label="下一步" (click)="step = 3"></button>
        </div>
      </div>

      <!-- 步驟 3: 檔案上傳 -->
      <div *ngIf="step === 3" class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold mb-2">檔案上傳 (選填)</h3>
        <div class="border-2 border-dashed border-gray-300 p-4 text-center">
          <input type="file" accept=".pdf" (change)="onFileSelected($event)" class="hidden" #fileInput />
          <button pButton type="button" label="選擇 PDF 檔案" (click)="fileInput.click()"></button>
          <p *ngIf="pdfFile" class="mt-2 text-sm text-gray-600">已選擇: {{ pdfFile.name }}</p>
          <p *ngIf="!pdfFile" class="mt-2 text-sm text-gray-500">PDF 檔案為選填項目，可稍後上傳</p>
        </div>
        <div class="flex justify-between mt-4">
          <button pButton type="button" label="上一步" (click)="step = 2"></button>
          <button pButton type="button" label="完成" (click)="finish()"></button>
        </div>
      </div>
    </div>
  `
})
export class CreateContractStepperComponent {
  @Input() initialMembers: ContractMember[] = [
    { name: '', role: '專案經理' },
    { name: '', role: '工程師' },
    { name: '', role: '業務' }
  ];
  @Output() contractCreated = new EventEmitter<void>();

  orderNo = '';
  projectNo = '';
  projectName = '';
  contractAmount: number | null = null;
  members: ContractMember[] = JSON.parse(JSON.stringify(this.initialMembers));
  pdfFile: File | null = null;
  step = 1;
  client = '';
  private functions = inject(Functions);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.pdfFile = input.files[0];
    }
  }



  async finish(): Promise<void> {
    if (!this.contractAmount) return;
    
    try {
      // 準備 PDF 檔案資料
      let pdfFileData = null;
      if (this.pdfFile) {
        const base64Data = await this.fileToBase64(this.pdfFile);
        pdfFileData = {
          name: this.pdfFile.name,
          type: this.pdfFile.type,
          size: this.pdfFile.size,
          base64Data
        };
      }

      // 使用新的 Firebase Function 建立合約
      const createContract = httpsCallable(this.functions, 'createContract');
      const result = await createContract({
        contractData: {
          orderNo: this.orderNo,
          projectNo: this.projectNo,
          projectName: this.projectName,
          client: this.client,
          contractAmount: this.contractAmount,
          members: this.members.filter(m => m.name.trim())
        },
        pdfFile: pdfFileData
      });
      
      if (!(result.data as any).success) {
        throw new Error((result.data as any).error);
      }
      
      this.contractCreated.emit();
      this.resetForm();
      alert('合約建立成功！');
    } catch (error: any) {
      console.error('建立合約失敗:', error);
      alert('建立合約失敗：' + (error.message || '請稍後再試'));
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 data:application/pdf;base64, 前綴
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  resetForm(): void {
    this.orderNo = '';
    this.projectNo = '';
    this.projectName = '';
    this.contractAmount = null;
    this.members = JSON.parse(JSON.stringify(this.initialMembers));
    this.pdfFile = null;
    this.step = 1;
    this.client = '';
  }
}