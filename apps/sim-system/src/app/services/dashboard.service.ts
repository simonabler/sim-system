import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DashboardSummaryRequest {
  days?: number;
  threshold?: number;
  articleGroupId?: number;
  from?: string;
  to?: string;
}

export interface DashboardSummary {
  generatedAt: string;
  filters: { from: string; to: string; days: number; threshold: number; articleGroupId: number | null };
  kpis: {
    totalArticles: number; trackedArticles: number; lowStockCount: number;
    outOfStockCount: number; inventoryAdjustmentsTodayCount: number;
    inventoryAdjustmentsTodayDelta: number; openSlipsheets: number;
    changedSlipsheets: number; openBills: number;
    totalStockValue: number;
  };
  lowStockItems: Array<{ id: number; name: string; code: string; unit: string; stock: number; inventoryStock: number; articleGroupName: string | null }>;
  recentInventoryActivities: Array<{ id: number; createdAt: string; amountNew: number; diff: number; article: { id: number; name: string; code: string; unit: string } | null }>;
  documentQueue: {
    openSlipsheets: Array<{ id: number; slipsheetnumber: string; state: string; createdAt: string; customerId: number | null; customerName: string }>;
    changedSlipsheets: Array<{ id: number; slipsheetnumber: string; state: string; createdAt: string; customerId: number | null; customerName: string }>;
    openBills: Array<{ id: number; billNumber: string; state: string; billDate: string; slipsheetCount: number; customerId: number | null; customerName: string }>;
  };
  topMovingArticles7: Array<{ id: number; name: string; code: string; unit: string; totalAmount: number }>;
  topMovingArticles30: Array<{ id: number; name: string; code: string; unit: string; totalAmount: number }>;
  stockTrend: Array<{ day: string; label: string; outgoing: number; adjustmentDelta: number }>;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(query: DashboardSummaryRequest): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (query?.days != null)           params = params.set('days', String(query.days));
    if (query?.threshold != null)      params = params.set('threshold', String(query.threshold));
    if (query?.articleGroupId != null) params = params.set('articleGroupId', String(query.articleGroupId));
    if (query?.from)                   params = params.set('from', query.from);
    if (query?.to)                     params = params.set('to', query.to);

    return this.http.get<any>('dashboard/summary', { params }).pipe(
      map(res => {
        if (res?.success) return res.data as DashboardSummary;
        throw new Error(res?.message || 'Dashboard konnte nicht geladen werden');
      })
    );
  }
}
