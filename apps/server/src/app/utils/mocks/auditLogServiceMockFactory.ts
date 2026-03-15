import { MockType } from './mock-type';
import { serviceMockFactory } from './serviceMockFactory';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export const auditLogServiceMockFactory: () => MockType<any> = jest.fn(() => ({
  ...serviceMockFactory(),
  logEntityAction: jest.fn((entity) => entity),
}));