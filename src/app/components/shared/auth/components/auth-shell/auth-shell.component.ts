import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.component.html',
  standalone: true,
  imports: [RouterOutlet]
})
export class AuthShellComponent {}
