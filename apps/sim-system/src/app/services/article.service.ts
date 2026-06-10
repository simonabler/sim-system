import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Article } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http.get<any>('articles').pipe(
      map(o => o.success ? o.data.map((a: any) => new Article(a)) : [])
    );
  }

  getByCode(code: string): Observable<Article> {
    const params = new HttpParams().set('code', code);
    return this.http.get<any>('articles', { params }).pipe(
      map(o => {
        if (o.success && o.data?.[0]) return new Article(o.data[0]);
        throw new Error(o.message || 'Artikel nicht gefunden');
      })
    );
  }

  getById(id: number): Observable<Article[]> {
    const params = new HttpParams().set('id', String(id));
    return this.http.get<any>('articles', { params }).pipe(
      map(o => o.success ? o.data : throwError(() => new Error(o.message)))
    );
  }

  create(article: Partial<Article>): Observable<Article> {
    return this.http.post<any>('articles', article).pipe(
      map(o => {
        if (o.success) return o.data;
        throw new Error(o.message || 'Fehler beim Anlegen');
      })
    );
  }

  update(article: Article): Observable<Article> {
    return this.http.patch<any>(`articles/${article.id}`, article).pipe(
      map(o => {
        if (o.success) return o.data;
        throw new Error(o.message || 'Fehler beim Speichern');
      })
    );
  }

  delete(article: Article): Observable<boolean> {
    return this.http.delete<any>(`articles/${article.id}`).pipe(
      map(o => {
        if (o.success) return true;
        throw new Error(o.message || 'Fehler beim Löschen');
      })
    );
  }

  createInventory(article: Article, newStock: number): Observable<Article> {
    return this.http.post<any>(`articles/${article.id}/inventory`, { newStock }).pipe(
      map(o => {
        if (o.success) return new Article(o.data);
        throw new Error(o.message || 'Fehler bei der Inventur');
      })
    );
  }

  importArticle(preview: boolean, formData: FormData): Observable<any> {
    let params = new HttpParams();
    if (preview) params = params.set('preview', 'true');
    return this.http.post<any>('articles/import', formData, { params });
  }
}
