// 本元件為應用程式根元件
// 功能：整合側邊欄、路由、全域訊息、權限初始化
// 用途：全域入口與主畫面
import { Component, effect, inject } from '@angular/core';
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
    <div class="flex">
      <app-left-panel />
      <div [class.ml-52]="!sidebarCollapsed()" [class.ml-16]="sidebarCollapsed()" class="flex-1">
        <p-toast></p-toast>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  providers: [MessageService]
})
export class AppComponent {
  private messageService = inject(MessageService);
  sidebarCollapsed = inject(LayoutService).sidebarCollapsed;
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
