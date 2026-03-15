import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Article } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {


  constructor(
    private http: HttpClient) {
  }

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>('articles')
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data.map(a => new Article(a));
          } else {
            return [];
          }
        })
      );
  }

  getByCode(code): Observable<Article> {

    const params = new HttpParams()
      .set('code', code);

    return this.http.get<Article>('articles', { params: params })
      .pipe(
        map((o: any) => {
          if (o.success) {
            return new Article(o.data[0]);
          } else {
            throwError(o.message || 'Fehler beim Suchen');
          }
        })
      );
  }

  getById(id): Observable<any[]> {

    const params = new HttpParams()
      .set('id', id);

    return this.http.get<any[]>('articles', { params: params })
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data;
          } else {
            return throwError(o.message || 'Fehler beim Suchen');
          }
        })
      );
  }


  create(article: Article): Observable<Article> {
    return this.http.post<any[]>('articles', article)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data;
          } else {
            return throwError(o.message || 'Fehler beim Anlegen');
          }
        })
      );
  }

  createInventory(article, newStock): Observable<Article> {
    return this.http.post<any[]>(`articles/${article.id}/inventory`, { newStock: newStock })
      .pipe(
        map((o: any) => {
          if (o.success) {
            return new Article(o.data);
          } else {
            throwError(o.message || 'Fehler bei der Inventur');
          }
        })
      );
  }

  update(article: Article): Observable<Article> {
    return this.http.patch<any[]>(`articles/${article.id}`, article)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.data;
          } else {
            return throwError(o.message || 'Fehler beim Anlegen');
          }
        })
      );
  }


  delete(article: Article): Observable<Article> {
    return this.http.delete<any[]>(`articles/${article.id}`)
      .pipe(
        map((o: any) => {
          if (o.success) {
            return o.success;
          } else {
            return throwError(o.message || 'Fehler beim Löschen');
          }
        })
      );
  }


  importArticle(preview: boolean, formData: FormData) {

    let params = new HttpParams()
    if (preview)
      params = params.set('preview', 'true');

    return this.http.post<any[]>(`articles/import`, formData, { params: params })

  }


}
