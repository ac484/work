// 本元件為應用程式根元件
// 功能：整合側邊欄、路由、全域訊息、權限初始化
// 用途：全域入口與主畫面
import { Component, effect, inject, signal } from '@angular/core';
import { AppSideModule } from './shell/layout.sidebar';
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './shared/modules/prime-ng.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { globalMessages, removeGlobalMessage } from './shared/utils/global-message-store';
import { LayoutService } from './core/services/layout/layout.service';
import { RoleManagementService } from './core/services/iam/roles/role-management.service';

@Component({
  selector: 'app-root',
  imports: [AppSideModule, RouterModule, PrimeNgModule, ToastModule],
  template: `
    <!-- 收起時顯示浮動展開按鈕 -->
    <button *ngIf="!sidebarOpen()" (click)="sidebarOpen.set(true)" class="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-r-full px-2 py-2 shadow" aria-label="展開側邊欄">
      <i class="pi pi-angle-right"></i>
    </button>
    <!-- 展開時顯示遮罩 -->
    <div *ngIf="sidebarOpen()" class="fixed inset-0 bg-black/20 z-40" (click)="sidebarOpen.set(false)"></div>
    <!-- 側邊欄 -->
    <app-left-panel [open]="sidebarOpen()" (openChange)="sidebarOpen.set($event)" />
    <!-- 主內容 -->
    <div class="flex-1 relative z-0">
      <p-toast></p-toast>
      <router-outlet></router-outlet>
    </div>
  `,
  providers: [MessageService]
})
export class AppComponent {
  private messageService = inject(MessageService);
  sidebarOpen = inject(LayoutService).sidebarOpen;
  // 強制注入 RoleManagementService 以觸發 admin 權限初始化
  private _roleInit = inject(RoleManagementService);

  constructor() {
    effect(() => {
      const msgs = globalMessages();
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        this.messageService.add(last);
        setTimeout(() => removeGlobalMessage(msgs.length - 1), 3000);
      }
    });
  }
}
