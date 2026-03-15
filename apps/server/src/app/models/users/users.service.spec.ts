import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepositoryMock: any;

  beforeEach(() => {
    usersRepositoryMock = {
      get: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      transform: jest.fn((entity: any) => entity),
      createEntity: jest.fn(),
      updateEntity: jest.fn(),
    };
    service = new UsersService(usersRepositoryMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate get()', async () => {
    usersRepositoryMock.get.mockResolvedValue({ id: 1 });

    const result = await service.get(1);

    expect(usersRepositoryMock.get).toHaveBeenCalledWith(1, [], true);
    expect(result).toEqual({ id: 1 });
  });

  it('should delegate getAll()', async () => {
    usersRepositoryMock.findAll.mockResolvedValue([{ id: 1 }]);

    const result = await service.getAll();

    expect(usersRepositoryMock.findAll).toHaveBeenCalledWith({
      relations: [],
      throwsException: true,
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should return true on successful delete()', async () => {
    usersRepositoryMock.delete.mockResolvedValue({ affected: 1 });

    const result = await service.delete(5);

    expect(result).toBe(true);
  });

  it('should throw NotFoundException on delete() when no row is affected', async () => {
    usersRepositoryMock.delete.mockResolvedValue({ affected: 0 });

    await expect(service.delete(5)).rejects.toThrow(NotFoundException);
  });

  it('should return transformed entity in getByName()', async () => {
    const row = { id: 2, username: 'alice' };
    usersRepositoryMock.findOne.mockResolvedValue(row);
    usersRepositoryMock.transform.mockReturnValue({ id: 2, username: 'alice' });

    const result = await service.getByName('alice' as any);

    expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { username: 'alice' },
      relations: [],
    });
    expect(usersRepositoryMock.transform).toHaveBeenCalledWith(row);
    expect(result).toEqual({ id: 2, username: 'alice' });
  });

  it('should delegate create()', async () => {
    const dto: any = { username: 'bob' };
    usersRepositoryMock.createEntity.mockResolvedValue({ id: 9 });

    const result = await service.create(dto);

    expect(usersRepositoryMock.createEntity).toHaveBeenCalledWith(dto, []);
    expect(result).toEqual({ id: 9 });
  });

  it('should delegate update()', async () => {
    const user: any = { id: 3 };
    const dto: any = { username: 'new' };
    usersRepositoryMock.updateEntity.mockResolvedValue({ id: 3, username: 'new' });

    const result = await service.update(user, dto);

    expect(usersRepositoryMock.updateEntity).toHaveBeenCalledWith(3, dto);
    expect(result).toEqual({ id: 3, username: 'new' });
  });
});
