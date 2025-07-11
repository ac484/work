import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { StatsWidget } from "./components/dashboard/statswidget";
import { SalesTrendWidget } from "./components/dashboard/salestrendwidget";
import { RecentActivityWidget } from "./components/dashboard/recentactivitywidget";
import { ProductOverviewWidget } from "./components/dashboard/productoverviewwidget";
import { AppFooter } from "./components/app.footer";

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter],
  template: `
    <div class="app-root-layout">
      <app-topbar></app-topbar>
      <div class="flex-1">
        
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-root-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .flex-1 {
      flex: 1 1 auto;
    }
  `]
})
export class AppComponent {
}
