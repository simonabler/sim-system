import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center;padding:4rem">
      <h1>500</h1>
      <p>Server-Fehler.</p>
      <a routerLink="/dashboard">Zurück zum Dashboard</a>
    </div>`,
})
export class P500Component {}
