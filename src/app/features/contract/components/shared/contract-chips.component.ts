// 本元件為極簡標籤（Tag/Chip）編輯器
// 功能：顯示、編輯、移除、增加合約標籤，支援雙向綁定
// 用途：合約列表與篩選器中的標籤管理
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TagService } from '../../services/management/contract-tag.service';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [CommonModule, ChipModule, FormsModule, InputTextModule],
  template: `
    <div class="flex flex-wrap gap-1 items-center">
      <p-chip
        *ngFor="let tag of tags; trackBy: trackByTag"
        [label]="tag"
        [removable]="true"
        (onRemove)="removeTag(tag)"
        class="text-xs px-2 py-1">
      </p-chip>
      <input
        *ngIf="editable"
        #tagInput
        type="text"
        pInputText
        [(ngModel)]="newTag"
        (keyup.enter)="addTag(); tagInput.value=''"
        (blur)="addTag()"
        placeholder="新增標籤"
        class="w-20 text-xs p-1 border-none outline-none min-w-[60px]"
        style="font-size: 0.75rem;"
      >
    </div>
  `
})
export class ChipsComponent {
  @Input() tags: string[] = [];
  @Input() editable = true;
  @Output() tagsChange = new EventEmitter<string[]>();

  newTag = '';
  constructor(private tagService: TagService) {}

  trackByTag(index: number, tag: string): string {
    return tag;
  }

  addTag(): void {
    const updated = this.tagService.add(this.tags, this.newTag);
    if (updated !== this.tags) {
      this.tagsChange.emit(updated);
    }
    this.newTag = '';
  }

  removeTag(tag: string): void {
    const updated = this.tagService.remove(this.tags, tag);
    this.tagsChange.emit(updated);
  }
}