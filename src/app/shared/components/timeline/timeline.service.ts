import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TimelineEvent {
  status: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
  [key: string]: unknown;
}

/**
 * TimelineService：集中管理 timeline 事件資料，支援新增、移除、查詢。
 * 僅用於多事件管理場景，極簡主義設計。
 */
@Injectable({ providedIn: 'root' })
export class TimelineService {
  private eventsSubject = new BehaviorSubject<TimelineEvent[]>([]);
  events$: Observable<TimelineEvent[]> = this.eventsSubject.asObservable();

  get events(): TimelineEvent[] {
    return this.eventsSubject.value;
  }

  add(event: TimelineEvent): void {
    this.eventsSubject.next([...this.eventsSubject.value, event]);
  }

  remove(index: number): void {
    const events = [...this.eventsSubject.value];
    events.splice(index, 1);
    this.eventsSubject.next(events);
  }

  clear(): void {
    this.eventsSubject.next([]);
  }
} 