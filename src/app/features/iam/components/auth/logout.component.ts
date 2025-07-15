// 登出元件
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IamFacadeService } from '../../services/core/iam-facade.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-3"></i>
        <p class="text-xl">正在登出...</p>
      </div>
    </div>
  `
})
export class LogoutComponent implements OnInit {
  private iamFacade = inject(IamFacadeService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    try {
      await this.iamFacade.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      this.router.navigate(['/login']);
    }
  }
}