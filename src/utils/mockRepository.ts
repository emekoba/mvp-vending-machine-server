import { Repository } from 'typeorm';
export type MockRepository<T = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
export const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  preload: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  insert: jest.fn(),
  remove: jest.fn(),
  query: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
  })),
});
