import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  imports: [CommonModule, SplitterModule],
  templateUrl: './finance-page.html',
  styleUrl: './finance-page.scss'
})
export class FinancePage {
  viewMode = signal<'finance' | 'project'>('finance');
  toggleView() {
    this.viewMode.set(this.viewMode() === 'finance' ? 'project' : 'finance');
  }
}
