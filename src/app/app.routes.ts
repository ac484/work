import { Routes } from '@angular/router';
import { WorkspacePage } from './workspace/workspace-page';
import { HubPage } from './hub/hub-page';
import { FinancePage } from './finance/finance-page';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'workspace', component: WorkspacePage },
  { path: 'hub', component: HubPage },
  { path: 'finance', component: FinancePage },
];
