import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  imports: [SplitterModule],
  templateUrl: './finance-page.html',
  styleUrl: './finance-page.scss'
})
export class FinancePage {}
