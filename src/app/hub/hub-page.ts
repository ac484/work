import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { MegaMenuModule } from 'primeng/megamenu';
import { MegaMenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-hub-page',
  standalone: true,
  imports: [SplitterModule, MegaMenuModule, AvatarModule],
  templateUrl: './hub-page.html',
  styleUrl: './hub-page.scss'
})
export class HubPage {
  items: MegaMenuItem[] = [
    {
      label: '主頁', icon: 'pi pi-home',
      items: [[{ label: '儀表板', icon: 'pi pi-chart-bar' }]]
    },
    {
      label: '文件', icon: 'pi pi-file',
      items: [[
        { label: '上傳', icon: 'pi pi-upload' },
        { label: '管理', icon: 'pi pi-cog' }
      ]]
    },
    {
      label: '設定', icon: 'pi pi-cog',
      items: [[{ label: '帳號', icon: 'pi pi-user-edit' }]]
    }
  ];
}
