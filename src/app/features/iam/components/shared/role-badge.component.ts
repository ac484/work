// 角色徽章元件
import { Component, Input } from '@angular/core';
import { PrimeNgModule } from '../../../../shared/modules/prime-ng.module';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [PrimeNgModule],
  template: `
    <p-tag 
      [value]="roleName"
      [severity]="getSeverity()"
      [icon]="getIcon()">
    </p-tag>
  `
})
export class RoleBadgeComponent {
  @Input() roleId!: string;
  @Input() roleName?: string;
  @Input() isSystem = false;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';

  getSeverity(): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    if (this.isSystem) return 'warning';
    
    switch (this.roleId) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'info';
      case 'user':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getIcon(): string {
    if (this.isSystem) return 'pi pi-cog';
    
    switch (this.roleId) {
      case 'admin':
        return 'pi pi-crown';
      case 'manager':
        return 'pi pi-briefcase';
      case 'user':
        return 'pi pi-user';
      default:
        return 'pi pi-users';
    }
  }
}