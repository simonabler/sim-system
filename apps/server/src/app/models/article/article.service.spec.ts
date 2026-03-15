import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ArticleService } from './article.service';

type QbMock = {
  addSelect: jest.Mock;
  leftJoinAndSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  getOne: jest.Mock;
  getMany: jest.Mock;
};

function createArticleQbMock(): QbMock {
  const qb: any = {};
  qb.addSelect = jest.fn(() => qb);
  qb.leftJoinAndSelect = jest.fn(() => qb);
  qb.where = jest.fn(() => qb);
  qb.andWhere = jest.fn(() => qb);
  qb.getOne = jest.fn(async () => null);
  qb.getMany = jest.fn(async () => []);
  return qb;
}

describe('ArticleService (Phase B: inventory + stock)', () => {
  let service: ArticleService;
  let articleRepository: any;
  let inventoryService: any;

  beforeEach(() => {
    articleRepository = {
      createQueryBuilder: jest.fn(),
      transform: jest.fn((entity: any) => entity),
      transformMany: jest.fn((entities: any[]) => entities),
      updateEntity: jest.fn(async () => undefined),
      update: jest.fn(async () => undefined),
      insert: jest.fn(async () => undefined),
      findOne: jest.fn(async () => null),
    };

    inventoryService = {
      create: jest.fn(async () => undefined),
    };

    service = new ArticleService(
      articleRepository,
      {} as any,
      inventoryService,
    );
  });

  describe('makeInventory', () => {
    it('should reject undefined newStock', async () => {
      await expect(
        service.makeInventory(
          { id: 1, code: 'A1', trackStock: true, stock: 5 } as any,
          undefined as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject negative newStock', async () => {
      await expect(
        service.makeInventory(
          { id: 1, code: 'A1', trackStock: true, stock: 5 } as any,
          -1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject inventory update for non-tracked article', async () => {
      await expect(
        service.makeInventory(
          { id: 1, code: 'A1', trackStock: false, stock: 5 } as any,
          3,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create inventory entry, update article and return refreshed article', async () => {
      const refreshed = { id: 1, code: 'A1', stock: 7 };
      const getByCodeSpy = jest
        .spyOn(service, 'getByCode')
        .mockResolvedValue(refreshed as any);

      const article: any = { id: 1, code: 'A1', trackStock: true, stock: 10 };
      const result = await service.makeInventory(article, 7);

      expect(inventoryService.create).toHaveBeenCalledWith({
        amountNew: 7,
        diff: 3,
        article,
      });
      expect(articleRepository.updateEntity).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          inventoryStock: 7,
          inventoryDate: expect.any(Date),
        }),
      );
      expect(getByCodeSpy).toHaveBeenCalledWith('A1');
      expect(result).toEqual(refreshed);
    });

    it('should allow zero stock and calculate diff correctly', async () => {
      jest.spyOn(service, 'getByCode').mockResolvedValue({} as any);
      const article: any = { id: 7, code: 'Z1', trackStock: true, stock: 2 };

      await service.makeInventory(article, 0);

      expect(inventoryService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amountNew: 0,
          diff: 2,
        }),
      );
    });
  });

  describe('stock calculation (get/getAll/getByCode)', () => {
    it('should compute stock in get()', async () => {
      const qb = createArticleQbMock();
      qb.getOne.mockResolvedValue({
        id: 11,
        code: 'C11',
        inventoryStock: 15,
        totalAmount: 4.5,
      });
      articleRepository.createQueryBuilder.mockReturnValue(qb);

      const result: any = await service.get(11);

      expect(qb.where).toHaveBeenCalledWith('article.id = :id', { id: 11 });
      expect(result.stock).toBe(10.5);
    });

    it('should compute stock in getByCode()', async () => {
      const qb = createArticleQbMock();
      qb.getOne.mockResolvedValue({
        id: 3,
        code: 'ABC',
        inventoryStock: 20,
        totalAmount: 8,
      });
      articleRepository.createQueryBuilder.mockReturnValue(qb);

      const result: any = await service.getByCode('ABC');

      expect(qb.where).toHaveBeenCalledWith('article.code = :code', {
        code: 'ABC',
      });
      expect(result.stock).toBe(12);
    });

    it('should compute stock in getAll() and default totalAmount to 0', async () => {
      const qb = createArticleQbMock();
      qb.getMany.mockResolvedValue([
        { id: 1, inventoryStock: 9, totalAmount: 4 },
        { id: 2, inventoryStock: 5, totalAmount: undefined },
      ]);
      articleRepository.createQueryBuilder.mockReturnValue(qb);

      const result: any[] = await service.getAll();

      expect(result[0].stock).toBe(5);
      expect(result[1].stock).toBe(5);
    });

    it('should return null for get() when not found and throwsException=false', async () => {
      const qb = createArticleQbMock();
      qb.getOne.mockResolvedValue(null);
      articleRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.get(999, [], false);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException for getByCode() when missing', async () => {
      const qb = createArticleQbMock();
      qb.getOne.mockResolvedValue(null);
      articleRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.getByCode('MISSING')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('query builder contract', () => {
    it('should constrain order sum by inventoryDate (inventory reset date effect)', () => {
      const qb = createArticleQbMock();
      let subqueryCallback: any = null;
      qb.addSelect.mockImplementation((callback: any) => {
        subqueryCallback = callback;
        return qb;
      });
      articleRepository.createQueryBuilder.mockReturnValue(qb);

      service.getQueryBuilder();

      expect(articleRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      );
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.articleGroup',
        'articlegroup',
      );
      expect(subqueryCallback).toBeInstanceOf(Function);

      const subQuery: any = {};
      subQuery.select = jest.fn(() => subQuery);
      subQuery.from = jest.fn(() => subQuery);
      subQuery.where = jest.fn(() => subQuery);
      subQuery.andWhere = jest.fn(() => subQuery);

      subqueryCallback(subQuery);

      expect(subQuery.where).toHaveBeenCalledWith(
        'orderEntry.articleId = article.id',
      );
      expect(subQuery.andWhere).toHaveBeenCalledWith(
        'orderEntry.createdAt >= article.inventoryDate',
      );
    });
  });
});
