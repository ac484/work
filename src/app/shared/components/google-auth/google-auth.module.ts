// 本模組為 Google 認證功能模組
// 功能：提供 GoogleAuthButtonComponent 與 AuthService
// 用途：集中管理 Google 認證相關依賴
import { NgModule } from '@angular/core';
import { GoogleAuthButtonComponent } from './google-auth-button.component';
import { AuthService } from './google-auth.service';

@NgModule({
  imports: [GoogleAuthButtonComponent],
  exports: [GoogleAuthButtonComponent],
  providers: [AuthService]
})
export class GoogleAuthModule {} 