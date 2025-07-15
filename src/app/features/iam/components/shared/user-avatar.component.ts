// 用戶頭像元件
import { Component, Input } from '@angular/core';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <p-avatar 
      [label]="getInitials()"
      [image]="photoURL"
      [size]="size"
      [shape]="shape"
      [class]="avatarClass"
      [pTooltip]="displayName || email">
    </p-avatar>
  `
})
export class UserAvatarComponent {
  @Input() displayName?: string;
  @Input() email?: string;
  @Input() photoURL?: string;
  @Input() size: 'normal' | 'large' | 'xlarge' = 'normal';
  @Input() shape: 'square' | 'circle' = 'circle';
  @Input() avatarClass = '';

  getInitials(): string {
    const name = this.displayName || this.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}