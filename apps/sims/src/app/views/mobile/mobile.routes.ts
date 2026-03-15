import { Routes } from '@angular/router';

export const mobileRoutes: Routes = [
  {
    path: 'tracking',
    loadComponent: () =>
      import('./mobile-tracking/mobile-tracking.component').then(m => m.MobileTrackingComponent),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./inventory/inventory.component').then(m => m.MobileInventoryComponent),
  },
  { path: '', redirectTo: 'tracking', pathMatch: 'full' },
];
