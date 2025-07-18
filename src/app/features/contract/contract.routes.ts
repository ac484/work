import { Routes } from '@angular/router';

export const contractRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/list/contract-list.component').then(m => m.ContractListComponent)
  }
];