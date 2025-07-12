import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { SidebarPanelmenuComponent } from './components/sidebar-panelmenu.component';

@Component({
  selector: 'app-hub-page',
  standalone: true,
  imports: [SplitterModule, SidebarPanelmenuComponent],
  templateUrl: './hub-page.html',
  styleUrl: './hub-page.scss'
})
export class HubPage {}
