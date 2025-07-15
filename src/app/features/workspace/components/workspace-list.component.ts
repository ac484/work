import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../services/workspace.service';
import { Workspace } from '../models/workspace.model';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul>
      <li *ngFor="let w of workspaces">
        <strong>{{ w.name }}</strong>｜狀態：{{ w.status }}｜進度：{{ w.progress }}%
      </li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceListComponent {
  workspaces: Workspace[];
  constructor(private ws: WorkspaceService) {
    this.workspaces = ws.getWorkspaces();
  }
}
