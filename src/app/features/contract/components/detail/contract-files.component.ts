// 本元件用於顯示合約檔案（PDF）預覽
// 功能：點擊後彈窗顯示 PDF 文件，支援檔案連結和 Google Docs Viewer 嵌入
// 用途：合約管理介面中的檔案預覽區塊
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Contract } from '../../models';

@Component({
  selector: 'app-contract-files',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <div class="h-full w-full flex flex-col justify-center items-center p-2">
      <ng-container *ngIf="contract && contract.url; else noFile">
        <div class="cursor-pointer flex flex-col justify-center items-center w-full h-full hover:bg-gray-50 dark:hover:bg-surface-700 rounded-lg p-4 transition-colors border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500" 
             (click)="openDialog()">
          <i class="pi pi-file-pdf text-4xl text-red-500 mb-3"></i>
          <div class="text-sm text-center font-medium text-gray-700 dark:text-gray-300 mb-1">合約檔案</div>
          <div class="text-xs text-center text-gray-500 dark:text-gray-400">點擊預覽</div>
        </div>
      </ng-container>
      
      <ng-template #noFile>
        <div class="flex flex-col justify-center items-center w-full h-full text-gray-400 dark:text-gray-500 min-h-[200px] p-4">
          <i class="pi pi-file text-4xl mb-3"></i>
          <div class="text-sm text-center font-medium mb-1">無檔案</div>
          <div class="text-xs text-center text-gray-300 dark:text-gray-400">合約: {{ contract?.code || '未選擇' }}</div>
        </div>
      </ng-template>
      
      <p-dialog 
        [(visible)]="show" 
        [modal]="true" 
        [style]="{width: '80vw', height: '90vh'}" 
        [contentStyle]="{'height':'calc(90vh - 120px)', 'padding': '0'}" 
        [closable]="true" 
        [dismissableMask]="true"
        [draggable]="false"
        [resizable]="true">
        <ng-template pTemplate="header">
          <div class="flex items-center gap-2">
            <i class="pi pi-file-pdf text-red-500"></i>
            <span>合約檔案預覽</span>
          </div>
        </ng-template>
        <div class="h-full w-full">
          <ng-container *ngIf="safeUrl">
            <iframe 
              [src]="safeUrl" 
              width="100%" 
              height="100%" 
              frameborder="0"
              style="border: none; min-height: 500px;">
            </iframe>
          </ng-container>
          <div *ngIf="!safeUrl" class="text-gray-500 text-center p-4">
            <i class="pi pi-file-pdf text-4xl mb-2"></i>
            <div>請選擇有 PDF 檔案的合約</div>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
      width: 100%; 
      height: 100%; 
    }
    :host > div {
      min-height: 100%;
    }
  `]
})
export class ContractFilesComponent implements OnChanges {
  @Input() contract: Contract | null = null;
  show = false;
  safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges() {
    console.log('ContractFilesComponent - 合約資料變化:', this.contract);
    if (this.contract?.url && (this.contract.url.includes('.pdf') || this.contract.url.includes('pdf'))) {
      // 使用 Google Docs Viewer 嵌入 PDF
      const gviewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.contract.url)}&embedded=true`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(gviewUrl);
      console.log('ContractFilesComponent - PDF URL 已設定:', gviewUrl);
    } else {
      this.safeUrl = null;
      console.log('ContractFilesComponent - 無 PDF URL 或格式不支援');
    }
  }

  openDialog(): void {
    if (this.contract?.url) {
      this.show = true;
    }
  }
}