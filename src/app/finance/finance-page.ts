import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { ContractComponent } from './components/contract/contract.component';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  imports: [SplitterModule, ContractComponent],
  templateUrl: './finance-page.html',
  styleUrl: './finance-page.scss'
})
export class FinancePage {}
