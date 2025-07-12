import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ContractMember, Contract } from '../../../shared/modules/contract.model';

@Component({
  selector: 'app-create-contract-stepper',
  template: '', // 請根據需求填入模板
  standalone: true
})
export class CreateContractStepperComponent {
  @Input() initialMembers: ContractMember[] = [];
  @Output() contractCreated = new EventEmitter<Contract>();
  // 其他必要 @Input/@Output 可依需求擴充
} 