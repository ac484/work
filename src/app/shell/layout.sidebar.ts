// 本元件為應用程式側邊欄（主導航）
// 功能：用戶資訊、主選單、主題切換、Google 認證、權限選單
// 用途：全域導航與操作入口
import { Component, inject, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfig } from '../core/config/layout.config';
import { LayoutService } from '../core/services/layout/layout.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../shared/components/google-auth/google-auth.service';
import { GoogleAuthButtonComponent } from '../shared/components/google-auth/google-auth-button.component';
import { AppUser } from '../core/services/iam/users/user.service';
import { UserService } from '../core/services/iam/users/user.service';
import { RoleManagementComponent } from '../features/role-management/role-management.component';

@Component({
  selector: 'app-left-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, StyleClassModule, MenubarModule, AppConfig, RouterLink, GoogleAuthButtonComponent],
  template: `
    <div *ngIf="open" class="fixed top-0 left-0 h-full bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col items-stretch z-50 transition-all duration-300"
         [ngClass]="{ 'w-52': !collapsed(), 'w-16': collapsed() }">
      <div class="flex flex-col items-center gap-4 py-6 flex-1">
        <!-- 收合/展開按鈕 -->
        <button type="button"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all mb-2"
          (click)="closeSidebar()"
          [attr.aria-label]="collapsed() ? '展開側邊欄' : '收合側邊欄'">
          <i class="pi" [ngClass]="collapsed() ? 'pi-angle-right' : 'pi-angle-left'"></i>
        </button>
        <!-- 頭像功能 -->
        <div class="flex flex-col items-center w-full mb-2" *ngIf="true">
          <ng-container *ngIf="user() as userData; else defaultAvatar">
            <img [src]="userData.photoURL ? userData.photoURL : 'user.svg'" [alt]="userData.displayName || userData.email || 'User'" [class]="collapsed() ? 'w-10 h-10' : 'w-14 h-14'" class="rounded-full border border-surface-300 shadow-sm object-cover" />
            <div class="mt-1 text-xs text-center w-full truncate" *ngIf="!collapsed()">{{userData.displayName || userData.email}}</div>
            <div class="text-[10px] text-center text-gray-400 w-full truncate" *ngIf="!collapsed()">{{userData.uid}}</div>
          </ng-container>
          <ng-template #defaultAvatar>
            <div [class]="collapsed() ? 'w-10 h-10' : 'w-14 h-14'" class="rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-2xl text-surface-500">
              <i class="pi pi-user"></i>
            </div>
          </ng-template>
        </div>
        <div class="flex flex-col gap-2 w-full mt-4">
          <ng-container *ngFor="let item of menuItems">
            <a *ngIf="!item.adminOnly || isAdmin()"
              [routerLink]="item.routerLink"
              pButton
              [label]="collapsed() ? '' : item.label"
              [icon]="item.icon"
              text
              class="w-full justify-start flex items-center"
              (click)="handleMenuClick(item, $event)"
              [attr.title]="item.label"
              [ngClass]="{ 'justify-center': collapsed() }"
            ></a>
          </ng-container>
        </div>
        <!-- 移除 sidebar 內權限矩陣 UI -->
        <div class="flex-1"></div>
        <div class="flex flex-col items-center gap-2 w-full mb-4">
          <p-button type="button"
            variant="text"
            class="w-10 h-10 flex items-center justify-center rounded-full"
            [ngClass]="isDarkMode() ? 'text-surface-0' : 'text-surface-900'"
            (click)="toggleDarkMode()">
            <i class="pi text-base" [ngClass]="{ 'pi-moon': isDarkMode(), 'pi-sun': !isDarkMode() }"></i>
          </p-button>
          <p-button type="button"
            variant="text"
            class="w-10 h-10 flex items-center justify-center rounded-full"
            [ngClass]="isDarkMode() ? 'text-surface-0' : 'text-surface-900'"
            aria-label="Settings"
            (click)="toggleSettings()">
            <i class="pi pi-cog"></i>
          </p-button>
        </div>
        <app-google-auth-button
          [isLoggedIn]="!!user()"
          [userName]="user()?.displayName || ''"
          [loading]="loading()"
          (loginGoogle)="onLoginGoogle()"
          (loginEmail)="onLoginEmail($event)"
          (registerEmail)="onRegisterEmail($event)"
          (changePassword)="onChangePassword($event)"
          (logout)="onLogout()"
          [iconOnly]="collapsed()"
        ></app-google-auth-button>
      </div>
      <!-- Settings 彈窗與遮罩 -->
      <ng-container *ngIf="settingsOpen()">
        <div class="fixed inset-0 z-50 bg-black/20" (click)="closeSettings()"></div>
        <div class="absolute top-32 right-0 z-50">
          <app-config />
        </div>
      </ng-container>
    </div>
  `,
})
export class AppSideModule {
  layoutService: LayoutService = inject(LayoutService);
  auth = inject(AuthService);
  userService = inject(UserService);
  loading = signal(false);
  user = toSignal<AppUser | null>(this.userService.currentUser$, { initialValue: null });

  isDarkMode = computed(() => this.layoutService.appState().darkMode);
  collapsed = this.layoutService.sidebarCollapsed;
  toggleCollapse() {
    this.layoutService.toggleSidebar();
  }

  toggleDarkMode() {
    this.layoutService.appState.update((state) => ({
      ...state,
      darkMode: !state.darkMode,
    }));
  }

  onLoginGoogle() {
    this.loading.set(true);
    this.auth.loginWithGoogle().finally(() => this.loading.set(false));
  }
  onLoginEmail({ email, password }: { email: string; password: string }) {
    this.loading.set(true);
    this.auth.loginWithEmail(email, password).finally(() => this.loading.set(false));
  }
  onRegisterEmail({ email, password }: { email: string; password: string }) {
    this.loading.set(true);
    this.auth.registerWithEmail(email, password).finally(() => this.loading.set(false));
  }
  onChangePassword({ email }: { email: string }) {
    this.loading.set(true);
    this.auth.changePassword(email).finally(() => this.loading.set(false));
  }
  onLogout() {
    this.loading.set(true);
    this.auth.logout().finally(() => this.loading.set(false));
  }

  static viewMode = signal<'hub' | 'project'>('hub');
  static injectViewMode = () => AppSideModule.viewMode;
  get viewModeValue() {
    return AppSideModule.viewMode();
  }
  static toggleView() {
    AppSideModule.viewMode.set(AppSideModule.viewMode() === 'hub' ? 'project' : 'hub');
  }

  handleMenuClick(item: { label: string }, event: Event) {
    if (item.label === '中樞') {
      AppSideModule.toggleView();
      event.preventDefault();
    }
  }

  menuItems = [
    { label: '儀表板', icon: 'pi pi-chart-bar', routerLink: '/dashboard' },
    { label: '中樞', icon: 'pi pi-sitemap', routerLink: '/hub' },
    { label: '工作空間', icon: 'pi pi-sitemap', routerLink: '/workspace' },
    { label: '權限管理', icon: 'pi pi-users', routerLink: '/roles', adminOnly: true },
    { label: '權限監控', icon: 'pi pi-eye', routerLink: '/permission-monitor', adminOnly: true }
  ];

  settingsOpen = signal(false);
  toggleSettings() {
    this.settingsOpen.set(!this.settingsOpen());
  }
  closeSettings() {
    this.settingsOpen.set(false);
  }

  isAdmin() {
    const u = this.user();
    return !!u && Array.isArray(u.roles) && u.roles.includes('admin');
  }

  @Input() open: boolean = false;
  @Output() openChange = new EventEmitter<boolean>();

  closeSidebar() {
    this.openChange.emit(false);
  }
  openSidebar() {
    this.openChange.emit(true);
  }
}

interface AppSideModuleConstructor {
  viewMode: ReturnType<typeof signal<'hub' | 'project'>>;
}