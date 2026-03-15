import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleService } from '../article/article.service';
import { InventoryRepository } from '../article/inventory.repository';
import { BillRepository } from './bill.repository';
import { OrderEntryRepository } from './order-entry.repository';
import { SlipsheetRepository } from './slipsheet.repository';
import { BillState } from './enums/bill-state.enum';
import { SlipsheetState } from './enums/slipsheet-state.enum';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly articleService: ArticleService,
    @InjectRepository(InventoryRepository)
    private readonly inventoryRepository: InventoryRepository,
    @InjectRepository(SlipsheetRepository)
    private readonly slipsheetRepository: SlipsheetRepository,
    @InjectRepository(BillRepository)
    private readonly billRepository: BillRepository,
    @InjectRepository(OrderEntryRepository)
    private readonly orderEntryRepository: OrderEntryRepository,
  ) {}

  async getSummary(query: DashboardSummaryQueryDto): Promise<any> {
    const filters = this.normalizeFilters(query);
    const allowFallback = !query?.from && !query?.to;
    const now = new Date();
    const todayStart = this.startOfDay(now);
    const todayEnd = this.endOfDay(now);
    const sevenDaysAgo = this.shiftDays(now, -7);
    const thirtyDaysAgo = this.shiftDays(now, -30);

    const allArticles = await this.articleService.getAll();
    const openSlipsheetsCount = Number(
      await this.slipsheetRepository.count({ state: SlipsheetState.OPEN } as any),
    );
    const changedSlipsheetsCount = Number(
      await this.slipsheetRepository.count({ state: SlipsheetState.CHANGED } as any),
    );
    const openBillsCount = Number(
      await this.billRepository.count({ state: BillState.OPEN } as any),
    );
    const todayInventoryActivities = await this.queryInventoryRange(
      todayStart,
      todayEnd,
      filters.articleGroupId,
      200,
    );
    let recentInventoryActivities = await this.queryInventoryRange(
      filters.from,
      filters.to,
      filters.articleGroupId,
      12,
    );
    if (!recentInventoryActivities.length && allowFallback) {
      recentInventoryActivities = await this.queryRecentInventoryActivities(
        filters.articleGroupId,
        12,
      );
    }
    const openSlipsheetsQueue = await this.slipsheetRepository.find({
      where: { state: SlipsheetState.OPEN },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: 8,
    });
    const changedSlipsheetsQueue = await this.slipsheetRepository.find({
      where: { state: SlipsheetState.CHANGED },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: 8,
    });
    const openBillsQueue = await this.billRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.slipsheets', 'slipsheet')
      .leftJoinAndSelect('slipsheet.customer', 'customer')
      .where('bill.state = :state', { state: BillState.OPEN })
      .orderBy('bill.createdAt', 'DESC')
      .take(8)
      .getMany();
    const topMoving7 = await this.queryTopMoving(
      sevenDaysAgo,
      now,
      filters.articleGroupId,
      10,
    );
    const topMoving30 = await this.queryTopMoving(
      thirtyDaysAgo,
      now,
      filters.articleGroupId,
      10,
    );
    let effectiveTrendFrom = filters.from;
    let effectiveTrendTo = filters.to;
    let trend = await this.buildTrend(
      effectiveTrendFrom,
      effectiveTrendTo,
      filters.articleGroupId,
    );

    if (allowFallback && !this.trendHasActivity(trend)) {
      const latestActivityDate = await this.findLatestActivityDate(
        filters.articleGroupId,
      );

      if (latestActivityDate && latestActivityDate < effectiveTrendFrom) {
        effectiveTrendTo = this.endOfDay(latestActivityDate);
        effectiveTrendFrom = this.startOfDay(
          this.shiftDays(effectiveTrendTo, -(filters.days - 1)),
        );

        trend = await this.buildTrend(
          effectiveTrendFrom,
          effectiveTrendTo,
          filters.articleGroupId,
        );
      }
    }

    const filteredArticles = this.filterArticlesByGroup(
      allArticles,
      filters.articleGroupId,
    );
    const trackedArticles = filteredArticles.filter((a) => !!a.trackStock);
    const lowStockArticles = trackedArticles
      .filter((a) => Number(a.stock ?? 0) <= filters.threshold)
      .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));
    const outOfStockArticles = trackedArticles.filter(
      (a) => Number(a.stock ?? 0) <= 0,
    );



    return {
      generatedAt: new Date().toISOString(),
      filters: {
        from: effectiveTrendFrom.toISOString(),
        to: effectiveTrendTo.toISOString(),
        days: filters.days,
        threshold: filters.threshold,
        articleGroupId: filters.articleGroupId || null,
      },
      kpis: {
        totalArticles: filteredArticles.length,
        trackedArticles: trackedArticles.length,
        lowStockCount: lowStockArticles.length,
        outOfStockCount: outOfStockArticles.length,
        inventoryAdjustmentsTodayCount: todayInventoryActivities.length,
        inventoryAdjustmentsTodayDelta: this.sum(
          todayInventoryActivities.map((item) => Number(item.diff || 0)),
        ),
        openSlipsheets: openSlipsheetsCount,
        changedSlipsheets: changedSlipsheetsCount,
        openBills: openBillsCount,
      },
      lowStockItems: lowStockArticles.slice(0, 15).map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        unit: item.unit,
        stock: Number(item.stock ?? 0),
        inventoryStock: Number(item.inventoryStock ?? 0),
        articleGroupName: item.articleGroup?.name || null,
      })),
      recentInventoryActivities: recentInventoryActivities.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        amountNew: Number(item.amountNew || 0),
        diff: Number(item.diff || 0),
        article: item.article
          ? {
              id: item.article.id,
              name: item.article.name,
              code: item.article.code,
              unit: item.article.unit,
            }
          : null,
      })),
      documentQueue: {
        openSlipsheets: openSlipsheetsQueue.map((item) => ({
          id: item.id,
          slipsheetnumber: item.slipsheetnumber,
          state: item.state,
          createdAt: item.createdAt,
          customerId: item.customer?.id || null,
          customerName:
            item.customer?.companyName ||
            `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim() ||
            '-',
        })),
        changedSlipsheets: changedSlipsheetsQueue.map((item) => ({
          id: item.id,
          slipsheetnumber: item.slipsheetnumber,
          state: item.state,
          createdAt: item.createdAt,
          customerId: item.customer?.id || null,
          customerName:
            item.customer?.companyName ||
            `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim() ||
            '-',
        })),
        openBills: openBillsQueue.map((item) => ({
          id: item.id,
          billNumber: item.billNumber,
          state: item.state,
          billDate: item.billDate,
          slipsheetCount: item.slipsheets?.length || 0,
          customerId: item.slipsheets?.[0]?.customer?.id || null,
          customerName: item.slipsheets?.[0]?.customer?.name || '-',
        })),
      },
      topMovingArticles7: topMoving7,
      topMovingArticles30: topMoving30,
      stockTrend: trend,
    };
  }

  private async queryTopMoving(
    from: Date,
    to: Date,
    articleGroupId?: number,
    limit = 10,
  ): Promise<any[]> {
    const fromParam = this.toDateParam(from);
    const toParam = this.toDateParam(to);
    const queryBuilder = this.orderEntryRepository
      .createQueryBuilder('orderEntry')
      .select('article.id', 'id')
      .addSelect('article.name', 'name')
      .addSelect('article.code', 'code')
      .addSelect('article.unit', 'unit')
      .addSelect('SUM(orderEntry.amount)', 'totalAmount')
      .leftJoin('orderEntry.article', 'article')
      .where('datetime(orderEntry.createdAt) >= datetime(:from)', {
        from: fromParam,
      })
      .andWhere('datetime(orderEntry.createdAt) <= datetime(:to)', {
        to: toParam,
      })
      .groupBy('article.id')
      .addGroupBy('article.name')
      .addGroupBy('article.code')
      .addGroupBy('article.unit')
      .orderBy('SUM(orderEntry.amount)', 'DESC')
      .take(limit);

    if (articleGroupId) {
      queryBuilder.andWhere('article.articleGroupId = :articleGroupId', {
        articleGroupId,
      });
    }

    const raw = await queryBuilder.getRawMany();
    return raw.map((item) => ({
      id: Number(item.id),
      name: item.name,
      code: item.code,
      unit: item.unit,
      totalAmount: Number(item.totalAmount || 0),
    }));
  }

  private async buildTrend(
    from: Date,
    to: Date,
    articleGroupId?: number,
  ): Promise<any[]> {
    const fromParam = this.toDateParam(from);
    const toParam = this.toDateParam(to);
    const outgoingQuery = this.orderEntryRepository
      .createQueryBuilder('orderEntry')
      .leftJoin('orderEntry.article', 'article')
      .where('datetime(orderEntry.createdAt) >= datetime(:from)', {
        from: fromParam,
      })
      .andWhere('datetime(orderEntry.createdAt) <= datetime(:to)', {
        to: toParam,
      });

    if (articleGroupId) {
      outgoingQuery.andWhere('article.articleGroupId = :articleGroupId', {
        articleGroupId,
      });
    }

    const outgoingEntries = await outgoingQuery.getMany();
    const inventoryEntries = await this.queryInventoryRange(
      from,
      to,
      articleGroupId,
      0,
      false,
    );

    const buckets = new Map<string, any>();
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = this.toDayKey(cursor);
      buckets.set(key, {
        day: key,
        label: this.toDayLabel(cursor),
        outgoing: 0,
        adjustmentDelta: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    outgoingEntries.forEach((entry: any) => {
      const key = this.toDayKey(entry.createdAt);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.outgoing += Number(entry.amount || 0);
      }
    });

    inventoryEntries.forEach((entry: any) => {
      const key = this.toDayKey(entry.createdAt);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.adjustmentDelta += Number(entry.diff || 0);
      }
    });

    return Array.from(buckets.values());
  }

  private async queryInventoryRange(
    from: Date,
    to: Date,
    articleGroupId?: number,
    take = 12,
    desc = true,
  ): Promise<any[]> {
    const fromParam = this.toDateParam(from);
    const toParam = this.toDateParam(to);
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.article', 'article')
      .where('datetime(inventory.createdAt) >= datetime(:from)', {
        from: fromParam,
      })
      .andWhere('datetime(inventory.createdAt) <= datetime(:to)', {
        to: toParam,
      })
      .orderBy('inventory.createdAt', desc ? 'DESC' : 'ASC');

    if (articleGroupId) {
      queryBuilder.leftJoinAndSelect('article.articleGroup', 'articleGroup');
      queryBuilder.andWhere('article.articleGroupId = :articleGroupId', {
        articleGroupId,
      });
    }

    if (take && take > 0) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
  }

  private async queryRecentInventoryActivities(
    articleGroupId?: number,
    take = 12,
  ): Promise<any[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.article', 'article')
      .leftJoinAndSelect('article.articleGroup', 'articleGroup')
      .orderBy('inventory.createdAt', 'DESC')
      .take(take);

    if (articleGroupId) {
      queryBuilder.where('article.articleGroupId = :articleGroupId', {
        articleGroupId,
      });
    }

    return queryBuilder.getMany();
  }

  private trendHasActivity(trend: any[]): boolean {
    return trend.some(
      (point) =>
        Number(point.outgoing || 0) !== 0 ||
        Number(point.adjustmentDelta || 0) !== 0,
    );
  }

  private async findLatestActivityDate(
    articleGroupId?: number,
  ): Promise<Date | null> {
    const [latestInventoryDate, latestOutgoingDate] = await Promise.all([
      this.getLatestInventoryDate(articleGroupId),
      this.getLatestOutgoingDate(articleGroupId),
    ]);

    if (!latestInventoryDate) {
      return latestOutgoingDate;
    }
    if (!latestOutgoingDate) {
      return latestInventoryDate;
    }
    return latestInventoryDate > latestOutgoingDate
      ? latestInventoryDate
      : latestOutgoingDate;
  }

  private async getLatestInventoryDate(
    articleGroupId?: number,
  ): Promise<Date | null> {
    const latest = await this.queryRecentInventoryActivities(articleGroupId, 1);
    return this.toValidDate(latest?.[0]?.createdAt);
  }

  private async getLatestOutgoingDate(
    articleGroupId?: number,
  ): Promise<Date | null> {
    const queryBuilder = this.orderEntryRepository
      .createQueryBuilder('orderEntry')
      .leftJoin('orderEntry.article', 'article')
      .orderBy('orderEntry.createdAt', 'DESC')
      .take(1);

    if (articleGroupId) {
      queryBuilder.where('article.articleGroupId = :articleGroupId', {
        articleGroupId,
      });
    }

    const latest = await queryBuilder.getOne();
    return this.toValidDate(latest?.createdAt);
  }

  private toValidDate(input: any): Date | null {
    if (!input) {
      return null;
    }
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }

  private filterArticlesByGroup(articles: any[], articleGroupId?: number) {
    if (!articleGroupId) {
      return articles;
    }
    return articles.filter(
      (item) => Number(item.articleGroup?.id || 0) === Number(articleGroupId),
    );
  }

  private normalizeFilters(query: DashboardSummaryQueryDto): {
    days: number;
    threshold: number;
    articleGroupId?: number;
    from: Date;
    to: Date;
  } {
    const now = new Date();
    const days = this.normalizeNumber(query.days, 30, 7, 120);
    const threshold = this.normalizeNumber(query.threshold, 10, 0, 100000);
    const defaultFrom = this.startOfDay(this.shiftDays(now, -(days - 1)));
    const defaultTo = this.endOfDay(now);
    const from = this.parseDate(query.from, defaultFrom);
    const to = this.parseDate(query.to, defaultTo);
    const articleGroupId = query.articleGroupId
      ? Number(query.articleGroupId)
      : undefined;

    if (from > to) {
      return {
        days,
        threshold,
        articleGroupId,
        from: defaultFrom,
        to: defaultTo,
      };
    }

    return { days, threshold, articleGroupId, from, to };
  }

  private normalizeNumber(
    value: number,
    fallback: number,
    min: number,
    max: number,
  ): number {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, parsed));
  }

  private parseDate(value: string, fallback: Date): Date {
    if (!value) {
      return fallback;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return fallback;
    }
    return parsed;
  }

  private shiftDays(date: Date, days: number): Date {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
  }

  private startOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private endOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
  }

  private toDayKey(input: Date): string {
    const date = new Date(input);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toDayLabel(input: Date): string {
    const date = new Date(input);
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${day}.${month}`;
  }

  private sum(values: number[]): number {
    return values.reduce((acc, current) => acc + Number(current || 0), 0);
  }

  private toDateParam(value: Date): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
  }
}
