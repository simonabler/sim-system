import { ModelRepository } from '../../models/model.repository';
import { MockType } from './mock-type';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export const repositoryMockFactory: () => MockType<
  ModelRepository<any, any>
> = jest.fn(() => ({
  get: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  findOne: jest.fn((entity) => entity),
  updateEntity: jest.fn((entity) => entity),
  findAll: jest.fn((entity) => entity),
  getAll: jest.fn((entity) => entity),
  createEntity: jest.fn((entity) => entity),
}));
