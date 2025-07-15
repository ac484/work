import { Routes } from '@angular/router';

export const workspaceRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./workspace.component').then(m => m.WorkspaceComponent)
  }
];
