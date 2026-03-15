import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center;padding:4rem">
      <h2>Login</h2>
      <p><a routerLink="/dashboard">Zum Dashboard</a></p>
    </div>`,
})
export class LoginComponent {}
