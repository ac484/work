import { Routes } from '@angular/router';
import { WorkspacePage } from './components/workspace/workspace-page';
import { HubPage } from './components/hub/hub-page';
import { FinancePage } from './components/finance/finance-page';

export const routes: Routes = [
  { path: 'workspace', component: WorkspacePage },
  { path: 'hub', component: HubPage },
  { path: 'finance', component: FinancePage },
];
