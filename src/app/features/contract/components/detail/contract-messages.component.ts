// 本元件為合約留言/備忘錄區塊
// 功能：即時留言、訊息同步、頻率限制、自動過期
// 用途：合約詳情頁的討論與備忘功能
import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { Firestore, collection as firestoreCollection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, serverTimestamp, getDocs, Timestamp, QuerySnapshot, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Contract, Message } from '../../models';

@Component({
  selector: 'app-contract-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DatePipe, ScrollPanelModule],
  template: `
    <div class="memo-panel" style="height:100%; min-height:0; display:flex; flex-direction:column; flex:1 1 0%;">
      <p-scrollPanel style="flex:1 1 0%; min-height:0; width:100%;">
        <ng-container *ngIf="loadingMessages">載入中...</ng-container>
        <ng-container *ngIf="!loadingMessages && messages.length === 0">不想記又怕忘記</ng-container>
        <div *ngFor="let msg of messages" class="memo-item p-2 mb-2 rounded shadow-sm">
          <div class="text-xs font-bold mb-1">
            {{ msg.user }}
            <span class="text-xs text-gray-400">
              {{ getMessageDate(msg) ? (getMessageDate(msg) | date:'yyyy/MM/dd HH:mm') : '' }}
            </span>
          </div>
          <div>{{ msg.message }}</div>
        </div>
      </p-scrollPanel>
      <form class="flex gap-2 mt-2" (ngSubmit)="addMemo()" style="flex-shrink:0;">
        <input pInputText [(ngModel)]="newMessage" name="newMemo" placeholder="輸入備忘內容..." class="flex-1" [disabled]="!contract" />
        <button
          pButton
          type="submit"
          label="新增備忘"
          icon="pi pi-bookmark"
          [disabled]="
            !newMessage.trim() ||
            loadingMessages ||
            !contract ||
            (getMemoCooldown() > 0 && memoTimestamps.length > 0 && (getNow() - memoTimestamps[memoTimestamps.length - 1] < getMemoCooldown()))
          "
        ></button>
      </form>
      <div *ngIf="memoError" class="text-xs text-red-600 mt-1">{{ memoError }}</div>
    </div>
  `
})
export class ContractMessagesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() contract: Contract | null = null;
  @Input() user: any = null;

  messages: Message[] = [];
  newMessage = '';
  loadingMessages = false;
  memoTimestamps: number[] = [];
  memoError = '';
  private messagesUnsub: (() => void) | null = null;
  private destroyed$ = new Subject<void>();
  private firestore = inject(Firestore);

  ngOnInit() {
    this.loadMemoTimestamps();
    this.listenMessages();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['contract']) {
      this.listenMessages();
    }
  }
  ngOnDestroy() {
    if (this.messagesUnsub) this.messagesUnsub();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  listenMessages(): void {
    if (this.messagesUnsub) this.messagesUnsub();
    if (!this.contract) return;
    this.loadingMessages = true;
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    const q = query(messagesCol, where('contractId', '==', this.contract.code), orderBy('createdAt', 'desc'));
    this.messagesUnsub = onSnapshot(q, (snap: QuerySnapshot<any>) => {
      this.messages = snap.docs.map((doc: QueryDocumentSnapshot<any>) => ({ id: doc.id, ...doc.data() } as Message));
      this.loadingMessages = false;
    });
  }
  async addMemo(): Promise<void> {
    if (!this.newMessage.trim() || !this.contract) return;
    const now = Date.now();
    const cooldown = this.getMemoCooldown();
    const lastTs = this.memoTimestamps.length > 0 ? this.memoTimestamps[this.memoTimestamps.length - 1] : 0;
    if (cooldown > 0 && now - lastTs < cooldown) {
      this.memoError = `備忘錄新增過於頻繁，請稍候 ${(Math.ceil((cooldown - (now - lastTs))/1000))} 秒再試。`;
      return;
    }
    this.memoError = '';
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    await addDoc(messagesCol, {
      contractId: this.contract.code,
      user: this.user?.displayName || '匿名',
      message: this.newMessage.trim(),
      createdAt: serverTimestamp(),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    this.memoTimestamps.push(now);
    this.saveMemoTimestamps();
    this.newMessage = '';
  }
  async removeExpiredMessages(): Promise<void> {
    const messagesCol = firestoreCollection(this.firestore, 'messages');
    const q = query(messagesCol, where('expireAt', '<=', new Date()));
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      await deleteDoc(doc.ref);
    }
  }
  loadMemoTimestamps(): void {
    const raw = localStorage.getItem('contract_memo_timestamps');
    this.memoTimestamps = raw ? JSON.parse(raw) : [];
    this.cleanupMemoTimestamps();
  }
  saveMemoTimestamps(): void {
    localStorage.setItem('contract_memo_timestamps', JSON.stringify(this.memoTimestamps));
  }
  cleanupMemoTimestamps(): void {
    const now = Date.now();
    this.memoTimestamps = this.memoTimestamps.filter(ts => now - ts < 30 * 24 * 60 * 60 * 1000);
    this.saveMemoTimestamps();
  }
  getMemoCooldown(): number {
    const now = Date.now();
    this.cleanupMemoTimestamps();
    const last5min = this.memoTimestamps.filter(ts => now - ts < 5 * 60 * 1000).length;
    if (last5min >= 1) return 5 * 60 * 1000;
    const last1hr = this.memoTimestamps.filter(ts => now - ts < 60 * 60 * 1000).length;
    if (last1hr >= 10) return 10 * 60 * 1000;
    const last24hr = this.memoTimestamps.filter(ts => now - ts < 24 * 60 * 60 * 1000).length;
    if (last24hr >= 30) return 60 * 60 * 1000;
    const last30d = this.memoTimestamps.length;
    if (last30d >= 200) return 24 * 60 * 60 * 1000;
    return 0;
  }
  getMessageDate(msg: Message): Date | null {
    if (!msg.createdAt) return null;
    if (typeof (msg.createdAt as any).toDate === 'function') {
      return (msg.createdAt as any).toDate();
    }
    if (msg.createdAt instanceof Date) return msg.createdAt;
    return null;
  }
  getNow(): number {
    return Date.now();
  }
}