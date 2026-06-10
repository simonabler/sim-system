import { plainToInstance } from 'class-transformer';
import { EntityManager, EntityTarget, Repository, DeepPartial, In, InsertResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ModelEntity } from '../common/serializers/model.serializer';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class ModelRepository<T, K extends ModelEntity> extends Repository<T> {
  constructor(target: EntityTarget<T>, manager: EntityManager) {
    super(target, manager);
  }

  async get(
    id: number,
    relations: string[] = [],
    throwsException = false,
  ): Promise<K | null> {
    return this.findOne({
      where: { id } as any,
      relations,
    })
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }

        return Promise.resolve(entity ? this.transform(entity) : null);
      })
      .catch((error) => Promise.reject(error));
  }

  async getAll(
    ids: number[],
    relations: string[] = [],
    throwsException = false,
  ): Promise<K[] | null> {
    return this.find({
      where: { id: In(ids) } as any,
      relations,
    })
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }

        return Promise.resolve(entity ? this.transformMany(entity) : null);
      })
      .catch((error) => Promise.reject(error));
  }

  async findAll({
    filter = null,
    relations = [],
    throwsException = false,
  }: {
    filter?: any;
    relations?: string[];
    throwsException?: boolean;
  }): Promise<K[] | null> {
    return await this.find({
      where: filter,
      relations,
    })
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }

        return Promise.resolve(entity ? this.transformMany(entity) : null);
      })
      .catch((error) => Promise.reject(error));
  }

  async findOneAsync(
    where: any = {},
    relations: string[] = [],
    throwsException = false,
  ): Promise<K | null> {
    return await this.findOne({
      where,
      relations,
    })
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Model not found.'));
        }

        return Promise.resolve(entity ? this.transform(entity) : null);
      })
      .catch((error) => Promise.reject(error));
  }

  async createEntity(
    inputs: DeepPartial<T>,
    relations: string[] = [],
  ): Promise<K> {
    return (
      this.insert(inputs as any)
        .then(
          async (entity: InsertResult) =>
            await this.get(entity.identifiers[0].id, relations),
        )
        .catch((error) => Promise.reject(error))
    );
  }

  async updateEntity(
    id: number,
    inputs: QueryDeepPartialEntity<T>,
    relations: string[] = [],
  ): Promise<K> {
    return this.update(id, inputs)
      .then(async () =>
      await this.get(id, relations)
      )
      .catch((error) => Promise.reject(error));
  }


  async updateEntities(
    ids: number[],
    inputs: QueryDeepPartialEntity<T>,
    relations: string[] = [],
  ): Promise<K[]> {
    return this.update(ids, inputs)
      .then(async () =>
      await this.getAll(ids, relations)
      )
      .catch((error) => Promise.reject(error));
  }

  transform(model: T, transformOptions = {}): K {
    return plainToInstance(ModelEntity, model, transformOptions) as K;
  }

  transformMany(models: T[], transformOptions = {}): K[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
}
