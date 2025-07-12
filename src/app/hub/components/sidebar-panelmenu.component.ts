import { Component, Input } from '@angular/core';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar-panelmenu',
  standalone: true,
  imports: [PanelMenuModule],
  templateUrl: './sidebar-panelmenu.component.html',
  styleUrl: './sidebar-panelmenu.component.scss',
})
export class SidebarPanelmenuComponent {
  @Input() userName: string = 'Amy Elsner';
  @Input() avatarUrl: string = 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
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
} 