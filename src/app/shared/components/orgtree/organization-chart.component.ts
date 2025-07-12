import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import type { ContractMember } from '../../modules/contract.model';
import { OrganizationChartService } from './organization-chart.service';

@Component({
  selector: 'app-organization-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, OrganizationChartModule],
  templateUrl: './organization-chart.component.html',
  styleUrls: ['./organization-chart.component.scss']
})
export class OrganizationChartComponent implements OnChanges {
  @Input() members: ContractMember[] | null = null;
  @Input() projectName = '專案團隊';
  @Output() membersChange = new EventEmitter<ContractMember[]>();
  chartData: TreeNode[] = [];
  private orgService = inject(OrganizationChartService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['members'] || changes['projectName']) {
      this.chartData = this.orgService.membersToTree(this.members, this.projectName);
    }
  }

  startEdit(node: TreeNode): void {
    this.orgService.startEdit(node);
  }
  saveEdit(node: TreeNode): void {
    this.orgService.saveEdit(node);
    this.emitMembers();
  }
  cancelEdit(node: TreeNode): void {
    this.orgService.cancelEdit(node);
  }
  private emitMembers(): void {
    this.membersChange.emit(this.orgService.treeToMembers(this.chartData));
  }
} 