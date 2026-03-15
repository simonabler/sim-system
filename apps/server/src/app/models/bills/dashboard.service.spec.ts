import { DashboardService } from './dashboard.service';

function createQueryBuilderMock(options: {
  getMany?: any[];
  getRawMany?: any[];
  getOne?: any;
}) {
  const qb: any = {};
  qb.leftJoinAndSelect = jest.fn(() => qb);
  qb.leftJoin = jest.fn(() => qb);
  qb.where = jest.fn(() => qb);
  qb.andWhere = jest.fn(() => qb);
  qb.orderBy = jest.fn(() => qb);
  qb.take = jest.fn(() => qb);
  qb.select = jest.fn(() => qb);
  qb.addSelect = jest.fn(() => qb);
  qb.groupBy = jest.fn(() => qb);
  qb.addGroupBy = jest.fn(() => qb);
  qb.getMany = jest.fn(async () => options.getMany || []);
  qb.getRawMany = jest.fn(async () => options.getRawMany || []);
  qb.getOne = jest.fn(async () => options.getOne || null);
  return qb;
}

describe('DashboardService', () => {
  it('should aggregate dashboard summary data', async () => {
    const articleService: any = {
      getAll: jest.fn(async () => [
        {
          id: 1,
          name: 'Artikel A',
          code: 'A1',
          unit: 'Stk',
          trackStock: true,
          stock: 3,
          inventoryStock: 10,
          articleGroup: { id: 1, name: 'Gruppe 1' },
        },
        {
          id: 2,
          name: 'Artikel B',
          code: 'B1',
          unit: 'Stk',
          trackStock: true,
          stock: 0,
          inventoryStock: 5,
          articleGroup: { id: 1, name: 'Gruppe 1' },
        },
      ]),
    };

    const inventoryQBQueue = [
      createQueryBuilderMock({
        getMany: [{ id: 1, diff: 2, amountNew: 5, createdAt: new Date(), article: { id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk' } }],
      }),
      createQueryBuilderMock({
        getMany: [{ id: 2, diff: -1, amountNew: 6, createdAt: new Date(), article: { id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk' } }],
      }),
      createQueryBuilderMock({
        getMany: [{ id: 3, diff: 1, amountNew: 4, createdAt: new Date(), article: { id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk' } }],
      }),
    ];
    const inventoryRepository: any = {
      createQueryBuilder: jest.fn(() => inventoryQBQueue.shift()),
    };

    const slipsheetRepository: any = {
      count: jest
        .fn()
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1),
      find: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: 10,
            slipsheetnumber: '100',
            state: 'open',
            createdAt: new Date(),
            customer: { id: 7, companyName: 'Test GmbH' },
          },
        ])
        .mockResolvedValueOnce([]),
    };

    const billRepository: any = {
      count: jest.fn().mockResolvedValue(1),
      createQueryBuilder: jest.fn(() =>
        createQueryBuilderMock({
          getMany: [],
        }),
      ),
    };

    const orderEntryQBQueue = [
      createQueryBuilderMock({
        getRawMany: [{ id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk', totalAmount: 12 }],
      }),
      createQueryBuilderMock({
        getRawMany: [{ id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk', totalAmount: 30 }],
      }),
      createQueryBuilderMock({
        getMany: [{ createdAt: new Date(), amount: 4 }],
      }),
    ];
    const orderEntryRepository: any = {
      createQueryBuilder: jest.fn(() => orderEntryQBQueue.shift()),
    };

    const service = new DashboardService(
      articleService,
      inventoryRepository,
      slipsheetRepository,
      billRepository,
      orderEntryRepository,
    );

    const summary = await service.getSummary({
      days: 30,
      threshold: 5,
    } as any);

    expect(summary.kpis.lowStockCount).toBe(2);
    expect(summary.kpis.outOfStockCount).toBe(1);
    expect(summary.kpis.openSlipsheets).toBe(2);
    expect(summary.kpis.openBills).toBe(1);
    expect(summary.lowStockItems.length).toBeGreaterThan(0);
    expect(summary.topMovingArticles7.length).toBe(1);
    expect(summary.stockTrend.length).toBeGreaterThan(0);
  });

  it('should fallback trend window and recent inventory for historical data', async () => {
    const oldDate = new Date('2023-03-15T10:00:00.000Z');

    const articleService: any = {
      getAll: jest.fn(async () => [
        {
          id: 1,
          name: 'Artikel A',
          code: 'A1',
          unit: 'Stk',
          trackStock: true,
          stock: 8,
          inventoryStock: 8,
        },
      ]),
    };

    const inventoryQBQueue = [
      createQueryBuilderMock({ getMany: [] }), // todayInventoryActivities
      createQueryBuilderMock({ getMany: [] }), // recentInventoryActivities in selected window
      createQueryBuilderMock({
        getMany: [{ id: 99, diff: 2, amountNew: 8, createdAt: oldDate, article: { id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk' } }],
      }), // fallback recentInventoryActivities
      createQueryBuilderMock({ getMany: [] }), // buildTrend (selected window) inventory
      createQueryBuilderMock({
        getMany: [{ id: 100, diff: 2, amountNew: 8, createdAt: oldDate, article: { id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk' } }],
      }), // findLatestActivityDate inventory
      createQueryBuilderMock({
        getMany: [{ id: 101, diff: 2, amountNew: 8, createdAt: oldDate, article: { id: 1, name: 'Artikel A', code: 'A1', unit: 'Stk' } }],
      }), // buildTrend (fallback window) inventory
    ];
    const inventoryRepository: any = {
      createQueryBuilder: jest.fn(() => inventoryQBQueue.shift()),
    };

    const slipsheetRepository: any = {
      count: jest.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(0),
      find: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]),
    };

    const billRepository: any = {
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn(() =>
        createQueryBuilderMock({
          getMany: [],
        }),
      ),
    };

    const orderEntryQBQueue = [
      createQueryBuilderMock({ getRawMany: [] }), // topMoving7
      createQueryBuilderMock({ getRawMany: [] }), // topMoving30
      createQueryBuilderMock({ getMany: [] }), // buildTrend (selected window) outgoing
      createQueryBuilderMock({
        getOne: { id: 1, createdAt: oldDate },
      }), // findLatestActivityDate outgoing
      createQueryBuilderMock({
        getMany: [{ id: 1, createdAt: oldDate, amount: 4 }],
      }), // buildTrend (fallback window) outgoing
    ];
    const orderEntryRepository: any = {
      createQueryBuilder: jest.fn(() => orderEntryQBQueue.shift()),
    };

    const service = new DashboardService(
      articleService,
      inventoryRepository,
      slipsheetRepository,
      billRepository,
      orderEntryRepository,
    );

    const summary = await service.getSummary({
      days: 30,
      threshold: 5,
    } as any);

    expect(summary.recentInventoryActivities.length).toBeGreaterThan(0);
    expect(
      summary.stockTrend.some(
        (point: any) =>
          Number(point.outgoing || 0) !== 0 ||
          Number(point.adjustmentDelta || 0) !== 0,
      ),
    ).toBe(true);
    expect(summary.filters.to.startsWith('2023-03-15')).toBe(true);
  });
});
