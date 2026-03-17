import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly navItems = [
    { label: 'Stammdaten', children: [
      { label: 'Artikel',  route: '/articles',  icon: '📦' },
      { label: 'Kunden',   route: '/customers', icon: '👤' },
    ]},
    { label: 'Belege', children: [
      { label: 'Lieferscheine', route: '/slipsheets', icon: '🚚' },
      { label: 'Rechnungen',    route: '/bills',      icon: '🧾' },
      { label: 'Neue Bestellung', route: '/order/new', icon: '➕' },
    ]},
    { label: 'Werkzeuge', children: [
      { label: 'Inventur', route: '/inventory', icon: '📋' },
    ]},
  ];

  readonly bottomNavItems = [
    { label: 'Artikel',  route: '/articles',  icon: '📦' },
    { label: 'Kunden',   route: '/customers', icon: '👤' },
    { label: 'Belege',   route: '/slipsheets',icon: '🚚' },
    { label: 'Inventur', route: '/inventory', icon: '📋' },
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
