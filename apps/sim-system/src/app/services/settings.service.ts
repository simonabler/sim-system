import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanySettings, PrinterOption } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private http: HttpClient) {}

  get(): Observable<CompanySettings> {
    return this.http.get<any>('settings').pipe(
      map(o => o.success ? new CompanySettings(o.data ?? {}) : new CompanySettings()),
    );
  }

  save(settings: Partial<CompanySettings>): Observable<CompanySettings> {
    return this.http.put<any>('settings', settings).pipe(
      map(o => {
        if (o.success) return new CompanySettings(o.data);
        throw new Error(o.message || 'Fehler beim Speichern');
      }),
    );
  }

  getPrinters(): Observable<PrinterOption[]> {
    return this.http.get<any>('settings/printers').pipe(
      map(o => o.success ? o.data : []),
    );
  }

  uploadLogo(file: File): Observable<CompanySettings> {
    return this._upload('settings/logo', file);
  }

  uploadBadge1(file: File): Observable<CompanySettings> {
    return this._upload('settings/badge1', file);
  }

  uploadBadge2(file: File): Observable<CompanySettings> {
    return this._upload('settings/badge2', file);
  }

  uploadTemplatePdf(file: File): Observable<CompanySettings> {
    return this._upload('settings/template-pdf', file);
  }

  private _upload(endpoint: string, file: File): Observable<CompanySettings> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(endpoint, fd).pipe(
      map(o => {
        if (o.success) return new CompanySettings(o.data);
        throw new Error(o.message || 'Upload fehlgeschlagen');
      }),
    );
  }
}
