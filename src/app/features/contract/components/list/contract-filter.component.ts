// 本元件為合約篩選器
// 功能：多欄位（業主、編號、狀態、金額、標籤）即時篩選，支援標籤編輯
// 用途：合約列表的搜尋與過濾功能
import { Component, Output, EventEmitter, inject } from '@angular/core';
import { FilterService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ChipsComponent } from '../shared/contract-chips.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ContractFilter } from '../../models';

@Component({
  selector: 'app-contract-filter',
  standalone: true,
  imports: [FormsModule, ChipsComponent],
  template: `
    <div class="flex gap-2 items-center">
      <input pInputText [(ngModel)]="filter.client" placeholder="業主" (input)="onFilter()" class="w-24 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input pInputText [(ngModel)]="filter.code" placeholder="合約編號" (input)="onFilter()" class="w-24 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input pInputText [(ngModel)]="filter.orderNo" placeholder="訂單編號" (input)="onFilter()" class="w-24 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input pInputText [(ngModel)]="filter.projectNo" placeholder="專案編號" (input)="onFilter()" class="w-24 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input pInputText [(ngModel)]="filter.projectName" placeholder="專案名稱" (input)="onFilter()" class="w-28 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input pInputText type="number" [(ngModel)]="filter.minAmount" placeholder="金額下限" (input)="onFilter()" class="w-16 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <span class="mx-1 text-gray-400">~</span>
      <input pInputText type="number" [(ngModel)]="filter.maxAmount" placeholder="上限" (input)="onFilter()" class="w-16 p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <app-chips [tags]="filter.tags || []" (tagsChange)="onTagsChange($event)" [editable]="true"></app-chips>
      <button type="button" pButton label="清除" (click)="clear()" class="ml-2 px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition"></button>
    </div>
  `
})
export class ContractFilterComponent {
  @Output() filterChange = new EventEmitter<ContractFilter>();
  filter: ContractFilter = {};
  private filterService = inject(FilterService);
  private filterSubject = new Subject<ContractFilter>();

  constructor() {
    this.filterSubject.pipe(debounceTime(300)).subscribe(f => {
      this.filterChange.emit({ ...f });
    });
  }

  onFilter(): void {
    this.filterSubject.next({ ...this.filter });
  }

  onTagsChange(tags: string[]): void {
    this.filter.tags = tags;
    this.onFilter();
  }

  clear(): void {
    this.filter = {};
    this.onFilter();
  }
}