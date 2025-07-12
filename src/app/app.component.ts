import { Component, effect, inject } from '@angular/core';
import { AppTopbar } from './shared/components/shell/app.topbar';
import { AppFooter } from "./shared/components/shell/app.footer";
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './shared/modules/prime-ng.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { globalMessages, removeGlobalMessage } from './shared/services/global-message-store';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, RouterModule, PrimeNgModule, ToastModule],
  template: `
    <app-topbar />
    <p-toast></p-toast>
    <router-outlet></router-outlet>
    <app-footer />
  `,
  providers: [MessageService]
})
export class AppComponent {
  private messageService = inject(MessageService);

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
