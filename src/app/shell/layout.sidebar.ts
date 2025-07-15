// 本元件為應用程式側邊欄（主導航）
// 功能：用戶資訊、主選單、主題切換、IAM 認證、權限選單
// 用途：全域導航與操作入口
import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfig } from '../core/config/layout.config';
import { LayoutService } from '../core/services/layout/layout.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { IamFacadeService } from '../features/iam/services/core/iam-facade.service';
import { AuthUser } from '../features/iam/models/auth.model';
import { UserAvatarComponent } from '../features/iam/components/shared/user-avatar.component';
import { IamAuthButtonComponent } from '../features/iam/components/shared/iam-auth-button.component';

@Component({
  selector: 'app-left-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, StyleClassModule, MenubarModule, AppConfig, RouterLink, UserAvatarComponent, IamAuthButtonComponent],
  template: `
    <div class="fixed top-0 left-0 h-full bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col items-stretch z-50 transition-all duration-300"
         [ngClass]="{ 'w-52': !collapsed(), 'w-16': collapsed() }">
      <div class="flex flex-col items-center gap-4 py-6 flex-1">
        <!-- 收合/展開按鈕 -->
        <button type="button"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all mb-2"
          (click)="toggleCollapse()"
          [attr.aria-label]="collapsed() ? '展開側邊欄' : '收合側邊欄'">
          <i class="pi" [ngClass]="collapsed() ? 'pi-angle-right' : 'pi-angle-left'"></i>
        </button>
        
        <!-- 用戶頭像和資訊 -->
        <div class="flex flex-col items-center w-full mb-2">
          <ng-container *ngIf="currentUser() as userData; else defaultAvatar">
            <app-user-avatar
              [displayName]="userData.displayName"
              [email]="userData.email"
              [photoURL]="userData.photoURL"
              [size]="collapsed() ? 'normal' : 'large'"
              class="cursor-pointer"
              (click)="goToProfile()">
            </app-user-avatar>
            <div class="mt-1 text-xs text-center w-full truncate" *ngIf="!collapsed()">
              {{ userData.displayName || userData.email }}
            </div>
            <div class="text-[10px] text-center text-gray-400 w-full truncate" *ngIf="!collapsed()">
              {{ userData.uid }}
            </div>
          </ng-container>
          <ng-template #defaultAvatar>
            <div [class]="collapsed() ? 'w-10 h-10' : 'w-14 h-14'" 
                 class="rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-2xl text-surface-500 cursor-pointer"
                 (click)="goToLogin()">
              <i class="pi pi-user"></i>
            </div>
            <div class="mt-1 text-xs text-center w-full" *ngIf="!collapsed()">
              <span class="text-blue-500 cursor-pointer" (click)="goToLogin()">點擊登入</span>
            </div>
          </ng-template>
        </div>
        
        <!-- 主選單 -->
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
        
        <div class="flex-1"></div>
        
        <!-- 設定按鈕 -->
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
        
        <!-- IAM 認證按鈕 -->
        <div class="w-full px-2">
          <app-iam-auth-button
            [isLoggedIn]="!!currentUser()"
            [userName]="currentUser()?.displayName || currentUser()?.email || ''"
            [loading]="loading()"
            [iconOnly]="collapsed()">
          </app-iam-auth-button>
        </div>
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
  iamFacade = inject(IamFacadeService);
  router = inject(Router);
  loading = signal(false);
  currentUser = toSignal<AuthUser | null>(this.iamFacade.getCurrentUser(), { initialValue: null });

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

  goToLogin(): void {
    this.router.navigate(['/iam/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/iam/users/profile']);
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
    { label: 'IAM 管理', icon: 'pi pi-shield', routerLink: '/iam', adminOnly: true },
    { label: '用戶管理', icon: 'pi pi-users', routerLink: '/iam/users', adminOnly: true },
    { label: '角色管理', icon: 'pi pi-key', routerLink: '/iam/roles', adminOnly: true },
    { label: '權限監控', icon: 'pi pi-eye', routerLink: '/iam/permissions/monitor', adminOnly: true }
  ];

  settingsOpen = signal(false);

  toggleSettings() {
    this.settingsOpen.set(!this.settingsOpen());
  }

  closeSettings() {
    this.settingsOpen.set(false);
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    // 暫時簡化實現，實際應該通過權限檢查
    return !!user && user.email?.includes('admin');
  }
}