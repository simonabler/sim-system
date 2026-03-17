import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArticleGroup } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleGroupService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ArticleGroup[]> {
    return this.http.get<any>('articlegroups').pipe(
      map(o => o.success ? o.data.map((a: any) => new ArticleGroup(a)) : [])
    );
  }
}
