import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './containers/default-layout/default-layout.component';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '404', component: P404Component },
  { path: '500', component: P500Component },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
      },
      {
        path: 'article',
        loadChildren: () => import('./views/article/article.routes').then(m => m.articleRoutes),
      },
      {
        path: 'mobile',
        loadChildren: () => import('./views/mobile/mobile.routes').then(m => m.mobileRoutes),
      },
      {
        path: 'admin',
        loadChildren: () => import('./views/admin/admin.routes').then(m => m.adminRoutes),
      },
    ],
  },
  { path: '**', component: P404Component },
];
