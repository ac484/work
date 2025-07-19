// 本服務為合約標籤管理服務
// 功能：標籤新增、移除、去重處理
// 用途：合約標籤的純函數操作
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  
  add(tags: string[], newTag: string): string[] {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) {
      return tags;
    }
    return [...tags, trimmed];
  }

  remove(tags: string[], tag: string): string[] {
    return tags.filter(t => t !== tag);
  }
}