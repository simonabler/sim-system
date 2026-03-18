import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./views/articles/articles.component').then(m => m.ArticlesComponent)
  },
  {
    path: 'articles/:id',
    loadComponent: () => import('./views/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./views/customers/customers.component').then(m => m.CustomersComponent)
  },
  {
    // Muss vor customers/:id stehen, damit 'new' nicht als ID gematcht wird
    path: 'customers/new',
    loadComponent: () => import('./views/customer-edit/customer-edit.component').then(m => m.CustomerEditComponent)
  },
  {
    path: 'customers/:id',
    loadComponent: () => import('./views/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () => import('./views/customer-edit/customer-edit.component').then(m => m.CustomerEditComponent)
  },
  {
    path: 'slipsheets',
    loadComponent: () => import('./views/slipsheets/slipsheets.component').then(m => m.SlipsheetsComponent)
  },
  {
    path: 'slipsheets/:id',
    loadComponent: () => import('./views/slipsheet-detail/slipsheet-detail.component').then(m => m.SlipsheetDetailComponent)
  },
  {
    path: 'bills',
    loadComponent: () => import('./views/bills/bills.component').then(m => m.BillsComponent)
  },
  {
    path: 'bills/:id',
    loadComponent: () => import('./views/bill-detail/bill-detail.component').then(m => m.BillDetailComponent)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./views/inventory/inventory.component').then(m => m.InventoryComponent)
  },
  {
    path: 'order/new',
    loadComponent: () => import('./views/order-new/order-new.component').then(m => m.OrderNewComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
