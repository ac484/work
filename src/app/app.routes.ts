import { Routes } from '@angular/router';
import { WorkspacePage } from './components/workspace/workspace-page';
import { HubPage } from './components/hub/hub-page';
import { FinancePage } from './components/finance/finance-page';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'workspace', component: WorkspacePage },
  { path: 'hub', component: HubPage },
  { path: 'finance', component: FinancePage },
];
