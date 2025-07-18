// 本檔案為全域訊息 signal 狀態管理
// 功能：訊息新增、移除、全域通知
// 用途：全域訊息提示與 Toast 整合
import { signal, computed } from '@angular/core';

export interface GlobalMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

const _messages = signal<GlobalMessage[]>([]);

export function addGlobalMessage(msg: GlobalMessage) {
  _messages.update((list: GlobalMessage[]) => [...list, msg]);
}

export function removeGlobalMessage(index: number) {
  _messages.update((list: GlobalMessage[]) => list.filter((_: GlobalMessage, i: number) => i !== index));
}

export const globalMessages = computed(() => _messages());
