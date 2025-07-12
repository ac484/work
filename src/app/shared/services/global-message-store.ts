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
