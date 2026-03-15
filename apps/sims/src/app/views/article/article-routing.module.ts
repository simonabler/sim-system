import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleComponent } from './article/article.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Artikel'
    },
    children: [
      {
        path: '',
        component: ArticleComponent,
      },
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticleRoutingModule { }
