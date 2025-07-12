import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from './components/app.footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, RouterOutlet],
  template: `
      <app-topbar>
        <router-outlet></router-outlet>
      <app-footer></app-footer>
  `,
  styles: [
    `.app-root-layout { min-height: 100vh; display: flex; flex-direction: column; }`,
    `.flex-1 { flex: 1 1 auto; }`
  ],
  standalone: true
})
export class AppComponent {}
