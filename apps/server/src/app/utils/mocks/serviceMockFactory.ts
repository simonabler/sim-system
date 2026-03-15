import { MockType } from './mock-type';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export const serviceMockFactory: () => MockType<any> = jest.fn(() => ({
  get: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  create: jest.fn((entity) => entity),
  getAll: jest.fn((entity) => entity),
  findOne: jest.fn((entity) => entity),
}));
