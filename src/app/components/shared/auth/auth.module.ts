import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { ResetPasswordComponent } from './components/reset-password.component';
import { LogoutComponent } from './components/logout.component';
import { AuthShellComponent } from './components/auth-shell.component';
import { AuthService } from './services/auth.service';

@NgModule({
  imports: [
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    LogoutComponent,
    AuthShellComponent
  ],
  providers: [AuthService],
  exports: [
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    LogoutComponent,
    AuthShellComponent
  ]
})
export class AuthModule {}