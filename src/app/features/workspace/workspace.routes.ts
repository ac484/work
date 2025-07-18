import { Routes } from '@angular/router';
import { WorkspaceComponent } from './workspace.component';

/**
 * 工作區模組路由配置
 */
export const workspaceRoutes: Routes = [
  {
    path: '',
    component: WorkspaceComponent,
    title: '工作區管理'
  }
];