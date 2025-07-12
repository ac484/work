import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from './components/app.footer';
import { AuthShellComponent } from './components/shared/auth/components/auth-shell.component';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, AuthShellComponent],
  template: `
    <div class="app-root-layout">
      <app-topbar></app-topbar>
      <div class="flex-1">
        <app-auth-shell></app-auth-shell>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-root-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .flex-1 {
      flex: 1 1 auto;
    }
  `]
})
export class AppComponent {}
