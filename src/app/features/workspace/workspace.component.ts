// 本元件為工作區分割畫面 demo
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceListComponent } from './components/workspace-list.component';
import { Workspace } from './models/workspace.model';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, SplitterModule, WorkspaceListComponent],
  template: `
    <div class="p-4 border-b flex items-center gap-4">
      <label for="project-search" class="font-semibold">搜尋/選擇專案：</label>
      <input id="project-search" type="text" class="border rounded px-2 py-1" [(ngModel)]="search" placeholder="輸入關鍵字..." style="width: 200px;" />
      <select class="border rounded px-2 py-1 w-72" [(ngModel)]="selectedProjectId" (change)="onSelect(selectedProjectId)">
        <option *ngFor="let p of filteredProjects()" [value]="p.id">{{ p.name }}</option>
      </select>
    </div>
    <p-splitter [panelSizes]="[50,50]" class="h-[calc(100vh-56px)]">
      <ng-template #panel>
        <div class="p-4">
          <h2 class="text-lg font-bold mb-2">專案進度</h2>
          <div class="mb-2 flex items-center">
            <span class="mr-2">進度：</span>
            <div class="flex-1 bg-gray-200 rounded h-2">
              <div class="bg-green-500 h-2 rounded" [style.width.%]="selectedWorkspace?.progress ?? 0"></div>
            </div>
            <span class="ml-2 text-xs text-gray-500">{{ selectedWorkspace?.progress ?? 0 }}%</span>
          </div>
          <h3 class="font-semibold mt-4 mb-2">項目/任務清單</h3>
          <app-workspace-list></app-workspace-list>
        </div>
      </ng-template>
      <ng-template #panel>
        <div class="p-4">
          <h3 class="font-semibold mb-2">日誌</h3>
          <ul class="text-xs text-gray-600">
            <li *ngFor="let log of selectedWorkspace?.logs ?? []">
              [{{ log.timestamp | date:'MM/dd HH:mm' }}] {{ log.user }}: {{ log.content }}
            </li>
          </ul>
        </div>
      </ng-template>
    </p-splitter>
  `
})
export class WorkspaceComponent {
  workspaces: Workspace[] = [];
  selectedProjectId: string | null = null;
  search = '';

  constructor(private ws: WorkspaceService) {
    this.workspaces = ws.getWorkspaces();
    this.selectedProjectId = this.workspaces[0]?.id ?? null;
  }

  get selectedWorkspace(): Workspace | undefined {
    return this.workspaces.find(w => w.id === this.selectedProjectId);
  }

  filteredProjects(): Workspace[] {
    const keyword = this.search.trim().toLowerCase();
    return keyword
      ? this.workspaces.filter((p: Workspace) => p.name.toLowerCase().includes(keyword))
      : this.workspaces;
  }

  onSelect(id: string | null) {
    this.selectedProjectId = id;
  }
}



