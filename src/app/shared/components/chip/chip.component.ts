import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule as PrimeChipModule } from 'primeng/chip';

/**
 * 本元件依據 PrimeNG v20 <p-chip> 實作，支援 label、icon、image、removable 等常用屬性。
 * 採用 OnPush 策略，極簡主義設計。
 */
@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule, PrimeChipModule],
  template: `
    <p-chip
      [label]="label"
      [icon]="icon"
      [image]="image"
      [removable]="removable"
      (onRemove)="remove.emit($event)"
      (onImageError)="imageError.emit($event)"
      [styleClass]="styleClass"
      [alt]="alt"
    >
      <ng-content></ng-content>
    </p-chip>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() image?: string;
  @Input() removable = false;
  @Input() styleClass?: string;
  @Input() alt?: string;

  @Output() remove = new EventEmitter<Event>();
  @Output() imageError = new EventEmitter<Event>();
} 