import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Workspace } from './models';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, SplitterModule, PanelModule, ButtonModule, SelectModule, FormsModule],
  template: `
    <div class="workspace-container">
      <div class="workspace-selector">
        <h2>工作區管理</h2>
        <p-select [options]="workspaces()" [(ngModel)]="selectedWorkspaceId" optionLabel="name" optionValue="id" placeholder="選擇工作區" [loading]="loadingWorkspaces()"></p-select>
        <p-button icon="pi pi-plus" label="新增工作區" size="small" (onClick)="createWorkspace()"></p-button>
      </div>
      <div *ngIf="selectedWorkspaceId" class="workspace-content">
        <div class="overview-section">{{ selectedWorkspaceId }}</div>
        <p-splitter [style]="{'height': 'calc(100vh - 300px)'}" [panelSizes]="[25, 75]" layout="horizontal">
          <ng-template pTemplate="panel"><div class="tree-panel">Tree</div></ng-template>
          <ng-template pTemplate="panel"><div class="task-panel">Task</div></ng-template>
        </p-splitter>
      </div>
      <div *ngIf="!selectedWorkspaceId" class="no-workspace-selected">請選擇或建立工作區</div>
    </div>
  `,
  styles: [`.workspace-container{height:100vh;display:flex;flex-direction:column;}`]
})
export class WorkspaceComponent implements OnInit {
  workspaces = signal<Workspace[]>([]);
  loadingWorkspaces = signal(false);
  selectedWorkspaceId: string | null = null;
  ngOnInit() {}
  createWorkspace() { alert('建立新工作區'); }
}