import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChipData {
  label: string;
  icon?: string;
  image?: string;
  removable?: boolean;
  styleClass?: string;
  alt?: string;
}

/**
 * ChipService：集中管理 chips 狀態，支援新增、移除、查詢。
 * 僅用於多 chip 管理場景，極簡主義設計。
 */
@Injectable({ providedIn: 'root' })
export class ChipService {
  private chipsSubject = new BehaviorSubject<ChipData[]>([]);
  chips$: Observable<ChipData[]> = this.chipsSubject.asObservable();

  get chips(): ChipData[] {
    return this.chipsSubject.value;
  }

  add(chip: ChipData): void {
    this.chipsSubject.next([...this.chipsSubject.value, chip]);
  }

  remove(index: number): void {
    const chips = [...this.chipsSubject.value];
    chips.splice(index, 1);
    this.chipsSubject.next(chips);
  }

  clear(): void {
    this.chipsSubject.next([]);
  }
} 