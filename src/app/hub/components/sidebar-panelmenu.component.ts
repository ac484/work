import { Component, Input } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { GoogleAuthService } from '../../shared/components/google-auth/google-auth.service';
import { GoogleAuthButtonComponent } from '../../shared/components/google-auth/google-auth-button.component';
import { CommonModule } from '@angular/common';

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
      label: '主頁', icon: 'pi pi-home',
      items: [
        { label: '儀表板', icon: 'pi pi-chart-bar' }
      ]
    },
    {
      label: '文件', icon: 'pi pi-file',
      items: [
        { label: '上傳', icon: 'pi pi-upload' },
        { label: '管理', icon: 'pi pi-cog' }
      ]
    },
    {
      label: '設定', icon: 'pi pi-cog',
      items: [
        { label: '帳號', icon: 'pi pi-user-edit' }
      ]
    }
  ];
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