import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-google-auth-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './google-auth-button.component.html',
  styleUrls: ['./google-auth-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoogleAuthButtonComponent {
  @Input() isLoggedIn = false;
  @Input() userName = '';
  @Output() login = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
} 