import { Component, effect, inject } from '@angular/core';
import { AppSideModule } from './hub/components/shell/app.sidebar';
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './shared/modules/prime-ng.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { globalMessages, removeGlobalMessage } from './shared/services/global-message-store';

@Component({
  selector: 'app-root',
  imports: [AppSideModule, RouterModule, PrimeNgModule, ToastModule],
  template: `
    <div class="flex">
      <app-left-panel />
      <div class="flex-1 ml-52">
        <p-toast></p-toast>
        <router-outlet></router-outlet>
      </div>
    </div>
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
