import { Routes } from '@angular/router';

export const articleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./article/article.component').then(m => m.ArticleComponent),
  },
];
