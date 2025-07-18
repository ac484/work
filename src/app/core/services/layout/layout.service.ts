// 本服務為全域佈局與主題狀態管理
// 功能：管理主題、顏色、深色模式、側邊欄收合、快取
// 用途：全域 UI 狀態與主題切換
import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppState {
  preset: string;
  primary: string;
  surface: string | undefined | null;
  darkMode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  _appState: AppState = {
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkMode: false,
  };

  appState = signal<AppState>(this._appState);

  transitionComplete: WritableSignal<boolean> = signal<boolean>(false);

  // 新增：側邊欄收合狀態 signal
  sidebarCollapsed = signal(false);
  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  sidebarOpen = signal(false);

  private initialized = false;

  private appStateUpdate = new Subject<AppState>();

  appStateUpdate$ = this.appStateUpdate.asObservable();

  constructor() {
    // 1. 初始化時還原
    const cached = localStorage.getItem('appState');
    if (cached) {
      this.appState.set(JSON.parse(cached));
      // 立刻根據 appState 設定深色 class
      this.toggleDarkMode(this.appState());
    }

    // 2. 每次變動時自動快取
    effect(() => {
      const appState = this.appState();
      if (appState) {
        localStorage.setItem('appState', JSON.stringify(appState));
      }
    });

    effect(() => {
      const state = this.appState();

      if (!this.initialized || !state) {
        this.initialized = true;
        return;
      }

      this.handleDarkModeTransition(state);
    });
  }

  private handleDarkModeTransition(config: AppState): void {
    if ((document as any).startViewTransition) {
      this.startViewTransition(config);
    } else {
      this.toggleDarkMode(config);
      this.onTransitionEnd();
    }
  }

  private startViewTransition(config: AppState): void {
    const transition = (document as any).startViewTransition(() => {
      this.toggleDarkMode(config);
    });

    transition.ready
      .then(() => {
        this.onTransitionEnd();
      })
      .catch(() => {});
  }

  toggleDarkMode(appState?: AppState): void {
    const _appState = appState || this.appState();
    if (_appState.darkMode) {
      document.documentElement.classList.add('p-dark');
    } else {
      document.documentElement.classList.remove('p-dark');
    }
  }

  private onTransitionEnd() {
    this.transitionComplete.set(true);
    setTimeout(() => {
      this.transitionComplete.set(false);
    });
  }

  onAppStateUpdate() {
    this._appState = { ...this.appState() };
    this.appStateUpdate.next(this.appState());
    this.toggleDarkMode();
  }
}
