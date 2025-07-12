import { Component, Input, computed, inject } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { GoogleAuthService } from '../../../shared/components/google-auth/google-auth.service';
import { GoogleAuthButtonComponent } from '../../../shared/components/google-auth/google-auth-button.component';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../shared/services/layout.service';

@Component({
  selector: 'app-sidebar-panelmenu',
  standalone: true,
  imports: [PanelMenuModule, GoogleAuthButtonComponent, CommonModule],
  templateUrl: './sidebar-panelmenu.component.html',
  styleUrl: './sidebar-panelmenu.component.scss',
})
export class SidebarPanelmenuComponent {
  @Input() avatarUrl: string = 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
  userName = '';
  isLoggedIn = false;
  loading = false;
  items: MenuItem[] = [
    {
      label: '儀表板', icon: 'pi pi-chart-bar', routerLink: '/dashboard'
    },
    {
      label: '工作空間', icon: 'pi pi-folder', routerLink: '/workspace'
    },
    {
      label: '財務', icon: 'pi pi-wallet', routerLink: '/finance'
    },
    {
      label: '中樞', icon: 'pi pi-sitemap', routerLink: '/hub'
    },
    {
      label: '工作', icon: 'pi pi-briefcase', routerLink: '/work'
    }
  ];
  layoutService: LayoutService = inject(LayoutService);
  isDarkMode = computed(() => this.layoutService.appState().darkMode);
  toggleDarkMode() {
    this.layoutService.appState.update((state) => ({
      ...state,
      darkMode: !state.darkMode,
    }));
  }
  constructor(private googleAuth: GoogleAuthService) {
    this.googleAuth.user$.subscribe((user: import('firebase/auth').User | null) => {
      this.isLoggedIn = !!user;
      this.userName = user?.displayName || '';
    });
  }
  async onLogin() {
    this.loading = true;
    try {
      await this.googleAuth.loginWithGoogle();
    } finally {
      this.loading = false;
    }
  }
  async onLogout() {
    this.loading = true;
    try {
      await this.googleAuth.logout();
    } finally {
      this.loading = false;
    }
  }
} 