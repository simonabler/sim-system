import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArticleRoutingModule } from './article-routing.module';
import { ArticleComponent } from './article/article.component';
import { ModalModule } from 'ngx-bootstrap';
import { ArticleEditComponent } from './article-edit/article-edit.component';


@NgModule({
    declarations: [
      ArticleComponent,
      ArticleEditComponent
    ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArticleRoutingModule,
    NgSelectModule,
    ModalModule.forRoot()

  ]
})
export class ArticleModule { }
