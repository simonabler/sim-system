import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ArticleGroup } from '../models';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleGroupService {

  constructor(
    private http: HttpClient) {
  }

  getAll(): Observable<ArticleGroup[]> {
    return this.http.get<ArticleGroup[]>('articlegroups')
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(a => new ArticleGroup(a));
          } else {
            return [];
          }
        })
      );
  }
}
