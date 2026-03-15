import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from '../article.service';

describe('ArticleController', () => {
  let controller: ArticleController;
  const articleServiceMock = {
    get: jest.fn(),
    getAll: jest.fn(),
    getByCode: jest.fn(),
    create: jest.fn(),
    makeInventory: jest.fn(),
    importCsv: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [{ provide: ArticleService, useValue: articleServiceMock }],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getByCode when code query is provided', async () => {
    const item = { id: 7, code: 'X1' };
    articleServiceMock.getByCode.mockResolvedValue(item);

    const result = await controller.getAll('X1', undefined);

    expect(articleServiceMock.getByCode).toHaveBeenCalledWith('X1');
    expect(result.data).toEqual([item]);
  });

  it('should call getAll when no query filter is provided', async () => {
    const items = [{ id: 1 }, { id: 2 }];
    articleServiceMock.getAll.mockResolvedValue(items);

    const result = await controller.getAll(undefined, undefined);

    expect(articleServiceMock.getAll).toHaveBeenCalled();
    expect(result.data).toEqual(items);
  });

  it('should call makeInventory in postInventory', async () => {
    const article = { id: 1, code: 'A1' };
    const updated = { ...article, stock: 9 };
    articleServiceMock.get.mockResolvedValue(article);
    articleServiceMock.makeInventory.mockResolvedValue(updated);

    const result = await controller.postInventory(1, { newStock: 9 } as any);

    expect(articleServiceMock.get).toHaveBeenCalledWith(1);
    expect(articleServiceMock.makeInventory).toHaveBeenCalledWith(article, 9);
    expect(result.data).toEqual(updated);
  });
});
