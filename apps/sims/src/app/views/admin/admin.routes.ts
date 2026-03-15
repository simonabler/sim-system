import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'customer',
    loadComponent: () => import('./customer/customer.component').then(m => m.CustomerComponent),
  },
  {
    path: 'customer/new',
    loadComponent: () => import('./customer-edit/customer-edit.component').then(m => m.CustomerEditComponent),
  },
  {
    path: 'customer/detail/:id',
    loadComponent: () =>
      import('./customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
  },
  {
    path: 'customer/edit/:id',
    loadComponent: () =>
      import('./customer-edit/customer-edit.component').then(m => m.CustomerEditComponent),
  },
  {
    path: 'bills',
    loadComponent: () => import('./bills/bills.component').then(m => m.BillsComponent),
  },
  { path: '', redirectTo: 'customer', pathMatch: 'full' },
];
