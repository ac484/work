import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from './components/app.footer';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter],
  template: `
    <div class="app-root-layout">
      <app-topbar></app-topbar>
      <div class="flex-1">
        <!-- 這裡不再顯示登入按鈕 -->
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `.app-root-layout { min-height: 100vh; display: flex; flex-direction: column; }`,
    `.flex-1 { flex: 1 1 auto; }`
  ],
  standalone: true
})
export class AppComponent {}
