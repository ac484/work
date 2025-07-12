import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule as PrimeTimelineModule } from 'primeng/timeline';

/**
 * 本元件依據 PrimeNG v20 <p-timeline> 實作，支援 value、align、layout、styleClass 及自訂 template。
 * 採用 OnPush 策略，極簡主義設計。
 */
@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, PrimeTimelineModule],
  template: `
    <p-timeline
      [value]="value"
      [align]="align"
      [layout]="layout"
      [styleClass]="styleClass"
    >
      <ng-template #content let-event>
        <ng-container *ngTemplateOutlet="contentTemplate ? contentTemplate : defaultContent; context: { $implicit: event }"></ng-container>
      </ng-template>
      <ng-template #opposite let-event>
        <ng-container *ngTemplateOutlet="oppositeTemplate ? oppositeTemplate : null; context: { $implicit: event }"></ng-container>
      </ng-template>
      <ng-template #marker let-event>
        <ng-container *ngTemplateOutlet="markerTemplate ? markerTemplate : null; context: { $implicit: event }"></ng-container>
      </ng-template>
      <ng-template #defaultContent let-event>{{ event.status || event.label || '' }}</ng-template>
    </p-timeline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent {
  @Input() value: any[] = [];
  @Input() align: string = 'left';
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() styleClass?: string;

  @ContentChild('content', { static: false }) contentTemplate?: TemplateRef<any>;
  @ContentChild('opposite', { static: false }) oppositeTemplate?: TemplateRef<any>;
  @ContentChild('marker', { static: false }) markerTemplate?: TemplateRef<any>;
} 