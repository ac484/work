import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-hub-page',
  standalone: true,
  imports: [SplitterModule],
  templateUrl: './hub-page.html',
  styleUrl: './hub-page.scss'
})
export class HubPage {}
